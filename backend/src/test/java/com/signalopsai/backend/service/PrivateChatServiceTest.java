package com.signalopsai.backend.service;

import com.signalopsai.backend.entity.ChatSession;
import com.signalopsai.backend.entity.KnowledgeDocument;
import com.signalopsai.backend.entity.KnowledgeDocumentChunk;
import com.signalopsai.backend.model.ChatRequest;
import com.signalopsai.backend.model.ChatResponse;
import com.signalopsai.backend.repository.ChatMessageRepository;
import com.signalopsai.backend.repository.ChatSessionRepository;
import com.signalopsai.backend.repository.KnowledgeDocumentChunkRepository;
import com.signalopsai.backend.repository.KnowledgeDocumentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PrivateChatServiceTest {

    @Mock
    private ChatSessionRepository chatSessionRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private KnowledgeDocumentRepository knowledgeDocumentRepository;

    @Mock
    private KnowledgeDocumentChunkRepository knowledgeDocumentChunkRepository;

    @Mock
    private EmbeddingService embeddingService;

    @InjectMocks
    private PrivateChatService privateChatService;

    @Test
    void retrievesRelevantKnowledgeChunks() {
        KnowledgeDocument document = new KnowledgeDocument("Operations playbook", "manual", "Incident response requires triage, escalation, and postmortem review.");
        KnowledgeDocumentChunk chunk = new KnowledgeDocumentChunk(document, 0, "Incident response requires triage, escalation, and postmortem review.", "source=manual", "[]");
        when(knowledgeDocumentChunkRepository.findAllWithDocument()).thenReturn(List.of(chunk));

        List<PrivateChatService.RetrievedContext> results = privateChatService.retrieveContext("incident response triage", 5);

        assertFalse(results.isEmpty());
        assertTrue(results.get(0).getScore() > 0.0);
        assertTrue(results.get(0).getSourceName().contains("Operations playbook"));
    }

    @Test
    void createsSessionAndGeneratesAssistantResponse() {
        when(chatSessionRepository.save(any(ChatSession.class))).thenAnswer(invocation -> {
            ChatSession saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });
        when(chatMessageRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(knowledgeDocumentChunkRepository.findAllWithDocument()).thenReturn(List.of());

        ChatResponse response = privateChatService.sendMessage(new ChatRequest(null, "How do we handle an incident?", "alice"));

        assertNotNull(response);
        assertNotNull(response.getAnswer());
        assertTrue(response.getAnswer().contains("knowledge base") || response.getAnswer().contains("private knowledge"));
    }

    @Test
    void rejectsBlankMessage() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> privateChatService.sendMessage(new ChatRequest(null, "   ", "alice"))
        );

        assertEquals("Message cannot be blank", exception.getMessage());
    }

    @Test
    void ingestsDocumentAndSplitsIntoChunks() {
        KnowledgeDocument document = new KnowledgeDocument("Ops runbook", "manual", "Follow the incident plan. Escalate immediately after triage.");
        when(knowledgeDocumentRepository.save(any(KnowledgeDocument.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(knowledgeDocumentChunkRepository.save(any(KnowledgeDocumentChunk.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(embeddingService.embed(any())).thenReturn(new double[] {0.1, 0.2, 0.3});

        KnowledgeDocument saved = privateChatService.ingestDocument("Ops runbook", "manual", "Follow the incident plan. Escalate immediately after triage.");

        assertNotNull(saved);
        assertEquals("Ops runbook", saved.getTitle());
    }
}
