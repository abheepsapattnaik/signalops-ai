package com.signalopsai.backend.controller;

import com.signalopsai.backend.entity.ChatMessage;
import com.signalopsai.backend.entity.ChatSession;
import com.signalopsai.backend.model.ChatRequest;
import com.signalopsai.backend.model.ChatResponse;
import com.signalopsai.backend.service.PrivateChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final PrivateChatService privateChatService;

    public ChatController(PrivateChatService privateChatService) {
        this.privateChatService = privateChatService;
    }

    @PostMapping("/chat/sessions")
    public ResponseEntity<ChatSession> createSession(@RequestBody Map<String, String> payload) {
        String title = payload != null ? payload.getOrDefault("title", "Private knowledge chat") : "Private knowledge chat";
        String userId = payload != null ? payload.getOrDefault("userId", "local-user") : "local-user";
        return ResponseEntity.ok(privateChatService.createSession(title, userId));
    }

    @GetMapping("/chat/sessions/{sessionId}/messages")
    public ResponseEntity<List<ChatMessage>> getMessages(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(privateChatService.getMessages(sessionId));
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> sendMessage(@Valid @RequestBody ChatRequest request) {
        return ResponseEntity.ok(privateChatService.sendMessage(request));
    }

    @PostMapping("/chat/ingest")
    public ResponseEntity<Map<String, String>> ingestDocument(
            @RequestParam String title,
            @RequestParam String sourceType,
            @RequestParam String content) {
        privateChatService.ingestDocument(title, sourceType, content);
        return ResponseEntity.ok(Map.of("status", "ingested"));
    }
}
