package com.signalopsai.backend.model;

import java.util.UUID;

public class ChatRequest {
    private UUID sessionId;
    private String message;
    private String userId;

    public ChatRequest() {
    }

    public ChatRequest(UUID sessionId, String message, String userId) {
        this.sessionId = sessionId;
        this.message = message;
        this.userId = userId;
    }

    public UUID getSessionId() {
        return sessionId;
    }

    public void setSessionId(UUID sessionId) {
        this.sessionId = sessionId;
    }

    public void setSessionId(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            this.sessionId = null;
            return;
        }
        this.sessionId = UUID.fromString(sessionId);
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
