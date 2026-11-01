package com.signalopsai.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.signalopsai.backend.entity.ChatSession;
import com.signalopsai.backend.model.ChatResponse;
import com.signalopsai.backend.service.PrivateChatService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ChatController.class)
class ChatControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PrivateChatService privateChatService;

    @Test
    void shouldCreateSession() throws Exception {
        ChatSession session = new ChatSession("Ops chat", "alice");
        session.setId(UUID.randomUUID());

        given(privateChatService.createSession("Ops chat", "alice")).willReturn(session);

        mockMvc.perform(post("/api/chat/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Ops chat\",\"userId\":\"alice\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Ops chat"))
                .andExpect(jsonPath("$.userId").value("alice"));
    }

    @Test
    void shouldSendMessage() throws Exception {
        UUID sessionId = UUID.randomUUID();
        ChatResponse response = new ChatResponse(sessionId, "Use the runbook", List.of("Ops runbook"));

        given(privateChatService.sendMessage(any())).willReturn(response);

        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sessionId\":\"" + sessionId + "\",\"message\":\"What does the runbook say?\",\"userId\":\"alice\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer").value("Use the runbook"))
                .andExpect(jsonPath("$.sources[0]").value("Ops runbook"));
    }

    @Test
    void shouldIngestDocument() throws Exception {
        given(privateChatService.ingestDocument("Ops runbook", "manual", "Escalate immediately.")).willReturn(null);

        mockMvc.perform(post("/api/chat/ingest")
                        .param("title", "Ops runbook")
                        .param("sourceType", "manual")
                        .param("content", "Escalate immediately."))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ingested"));
    }
}
