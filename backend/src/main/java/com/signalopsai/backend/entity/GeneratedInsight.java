package com.signalopsai.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "generated_insights")
public class GeneratedInsight {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 2048)
    private String productIdea;

    @Column(nullable = false, length = 2048)
    private String prompt;

    @Column(nullable = false)
    private String team;

    @Column(nullable = false, length = 4096)
    private String summary;

    @Column(nullable = false)
    private String health;

    @Column(nullable = false, length = 4096)
    private String leaderMessage;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public GeneratedInsight() {
        this.createdAt = LocalDateTime.now();
    }

    public GeneratedInsight(String productIdea, String prompt, String team, String summary,
                           String health, String leaderMessage, String source) {
        this.productIdea = productIdea;
        this.prompt = prompt;
        this.team = team;
        this.summary = summary;
        this.health = health;
        this.leaderMessage = leaderMessage;
        this.source = source;
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getProductIdea() {
        return productIdea;
    }

    public void setProductIdea(String productIdea) {
        this.productIdea = productIdea;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getTeam() {
        return team;
    }

    public void setTeam(String team) {
        this.team = team;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getHealth() {
        return health;
    }

    public void setHealth(String health) {
        this.health = health;
    }

    public String getLeaderMessage() {
        return leaderMessage;
    }

    public void setLeaderMessage(String leaderMessage) {
        this.leaderMessage = leaderMessage;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
