package com.signalopsai.backend.service;

import com.signalopsai.backend.entity.ChatMessage;
import com.signalopsai.backend.entity.ChatSession;
import com.signalopsai.backend.entity.KnowledgeDocument;
import com.signalopsai.backend.entity.KnowledgeDocumentChunk;
import com.signalopsai.backend.model.ChatRequest;
import com.signalopsai.backend.model.ChatResponse;
import com.signalopsai.backend.repository.ChatMessageRepository;
import com.signalopsai.backend.repository.ChatSessionRepository;
import com.signalopsai.backend.repository.KnowledgeDocumentChunkRepository;
import com.signalopsai.backend.repository.KnowledgeDocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

@Service
public class PrivateChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final KnowledgeDocumentRepository knowledgeDocumentRepository;
    private final KnowledgeDocumentChunkRepository knowledgeDocumentChunkRepository;
    private final EmbeddingService embeddingService;

    public PrivateChatService(ChatSessionRepository chatSessionRepository,
                             ChatMessageRepository chatMessageRepository,
                             KnowledgeDocumentRepository knowledgeDocumentRepository,
                             KnowledgeDocumentChunkRepository knowledgeDocumentChunkRepository,
                             EmbeddingService embeddingService) {
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.knowledgeDocumentRepository = knowledgeDocumentRepository;
        this.knowledgeDocumentChunkRepository = knowledgeDocumentChunkRepository;
        this.embeddingService = embeddingService;
    }

    @Transactional
    public ChatSession createSession(String title, String userId) {
        String sessionTitle = (title == null || title.isBlank()) ? "Private knowledge chat" : title.trim();
        String owner = (userId == null || userId.isBlank()) ? "local-user" : userId.trim();
        ChatSession session = new ChatSession(sessionTitle, owner);
        return chatSessionRepository.save(session);
    }

    public List<ChatMessage> getMessages(UUID sessionId) {
        if (sessionId == null) {
            return List.of();
        }
        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    @Transactional
    public ChatResponse sendMessage(ChatRequest request) {
        if (request == null || request.getMessage() == null || request.getMessage().isBlank()) {
            throw new IllegalArgumentException("Message cannot be blank");
        }

        ChatSession session = resolveSession(request.getSessionId(), request.getUserId());
        String userMessage = request.getMessage().trim();
        chatMessageRepository.save(new ChatMessage(session, "user", userMessage, null));

        List<RetrievedContext> context = retrieveContext(userMessage, 4);
        String answer = synthesizeAnswer(userMessage, context);
        String references = context.stream().map(RetrievedContext::getSourceName).distinct().toList().toString();
        chatMessageRepository.save(new ChatMessage(session, "assistant", answer, references));

        return new ChatResponse(session.getId(), answer, context.stream().map(RetrievedContext::getSourceName).distinct().toList());
    }

    @Transactional
    public KnowledgeDocument ingestDocument(String title, String sourceType, String content) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Document title cannot be blank");
        }
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Document content cannot be blank");
        }

        KnowledgeDocument document = new KnowledgeDocument(title.trim(), sourceType == null || sourceType.isBlank() ? "manual" : sourceType.trim(), content);
        knowledgeDocumentRepository.save(document);

        List<String> chunks = splitIntoChunks(content, 400);
        for (int i = 0; i < chunks.size(); i++) {
            String chunk = chunks.get(i);
            String embedding = java.util.Arrays.toString(embeddingService.embed(chunk));
            knowledgeDocumentChunkRepository.save(new KnowledgeDocumentChunk(document, i, chunk, "source=" + document.getSourceType(), embedding));
        }

        return document;
    }

    public List<RetrievedContext> retrieveContext(String query, int limit) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        return knowledgeDocumentChunkRepository.findAllWithDocument().stream()
                .map(chunk -> new RetrievedContext(chunk, scoreChunk(query, chunk.getContent())))
                .filter(match -> match.getScore() > 0.0)
                .sorted(Comparator.comparingDouble(RetrievedContext::getScore).reversed())
                .limit(Math.max(1, limit))
                .toList();
    }

    private String synthesizeAnswer(String question, List<RetrievedContext> context) {
        if (context == null || context.isEmpty()) {
            return "I could not find a strong match in the private knowledge base. Add a document or ask a more specific question about the project context.";
        }

        StringBuilder prompt = new StringBuilder();
        prompt.append("Answer from private knowledge base.\n");
        prompt.append("Question: ").append(question).append("\n\n");
        prompt.append("Relevant context:\n");
        for (RetrievedContext match : context) {
            prompt.append("- ").append(match.getSourceName()).append(": ").append(match.getSnippet()).append("\n");
        }

        return prompt.toString().trim();
    }

    private ChatSession resolveSession(UUID sessionId, String userId) {
        if (sessionId != null) {
            return chatSessionRepository.findById(sessionId)
                    .orElseGet(() -> createSession("Private knowledge chat", userId));
        }
        return createSession("Private knowledge chat", userId);
    }

    private double scoreChunk(String query, String content) {
        if (content == null || content.isBlank()) {
            return 0.0;
        }

        String normalizedQuery = query.toLowerCase(Locale.ROOT);
        String normalizedContent = content.toLowerCase(Locale.ROOT);
        List<String> queryTerms = List.of(normalizedQuery.replaceAll("[^a-z0-9\\s]", " ").split("\\s+"));
        int matches = 0;
        for (String term : queryTerms) {
            if (term.isBlank()) {
                continue;
            }
            if (normalizedContent.contains(term)) {
                matches++;
            }
        }
        return matches * 1.25 + Math.min(2.0, content.length() / 250.0);
    }

    private List<String> splitIntoChunks(String content, int chunkSize) {
        List<String> chunks = new ArrayList<>();
        String sanitized = content.trim();
        if (sanitized.isEmpty()) {
            return chunks;
        }

        String[] parts = sanitized.split("(?<=\\.)\\s+");
        StringBuilder current = new StringBuilder();
        for (String part : parts) {
            if (current.length() + part.length() > chunkSize && !current.isEmpty()) {
                chunks.add(current.toString().trim());
                current = new StringBuilder();
            }
            current.append(part).append(" ");
        }

        if (!current.isEmpty()) {
            chunks.add(current.toString().trim());
        }

        return chunks.isEmpty() ? List.of(sanitized) : chunks;
    }

    public static class RetrievedContext {
        private final KnowledgeDocumentChunk chunk;
        private final double score;

        private RetrievedContext(KnowledgeDocumentChunk chunk, double score) {
            this.chunk = chunk;
            this.score = score;
        }

        public double getScore() {
            return score;
        }

        public String getSourceName() {
            return chunk != null && chunk.getDocument() != null ? chunk.getDocument().getTitle() : "private-kb";
        }

        public String getSnippet() {
            return chunk == null ? "" : chunk.getContent();
        }

        public KnowledgeDocumentChunk getChunk() {
            return chunk;
        }
    }
}
