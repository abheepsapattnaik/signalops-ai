package com.signalopsai.backend.model;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ChatResponse {
    private UUID sessionId;
    private String answer;
    private List<String> sources = new ArrayList<>();

    public ChatResponse() {
    }

    public ChatResponse(UUID sessionId, String answer, List<String> sources) {
        this.sessionId = sessionId;
        this.answer = answer;
        this.sources = sources == null ? new ArrayList<>() : new ArrayList<>(sources);
    }

    public UUID getSessionId() {
        return sessionId;
    }

    public void setSessionId(UUID sessionId) {
        this.sessionId = sessionId;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public List<String> getSources() {
        return sources;
    }

    public void setSources(List<String> sources) {
        this.sources = sources == null ? new ArrayList<>() : new ArrayList<>(sources);
    }
}
