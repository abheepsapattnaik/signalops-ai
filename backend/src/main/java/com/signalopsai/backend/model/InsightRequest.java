package com.signalopsai.backend.model;

public class InsightRequest {
    private String prompt;
    private String productIdea;
    private String team = "Platform & AI Ops";
    private String source = "AI";

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getProductIdea() {
        return productIdea;
    }

    public void setProductIdea(String productIdea) {
        this.productIdea = productIdea;
    }

    public String getTeam() {
        return team;
    }

    public void setTeam(String team) {
        this.team = team;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}
