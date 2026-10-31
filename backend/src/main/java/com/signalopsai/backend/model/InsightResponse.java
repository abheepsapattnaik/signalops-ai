package com.signalopsai.backend.model;

import java.util.ArrayList;
import java.util.List;

public class InsightResponse {
    private String summary;
    private String health;
    private String leaderMessage;
    private List<RoadmapItem> roadmap = new ArrayList<>();
    private List<String> risks = new ArrayList<>();
    private List<String> recommendations = new ArrayList<>();
    private ArchitectureInsight architecture;
    private LeadershipSignals leadershipSignals;
    private String source;

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

    public List<RoadmapItem> getRoadmap() {
        return roadmap;
    }

    public void setRoadmap(List<RoadmapItem> roadmap) {
        this.roadmap = roadmap;
    }

    public List<String> getRisks() {
        return risks;
    }

    public void setRisks(List<String> risks) {
        this.risks = risks;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }

    public ArchitectureInsight getArchitecture() {
        return architecture;
    }

    public void setArchitecture(ArchitectureInsight architecture) {
        this.architecture = architecture;
    }

    public LeadershipSignals getLeadershipSignals() {
        return leadershipSignals;
    }

    public void setLeadershipSignals(LeadershipSignals leadershipSignals) {
        this.leadershipSignals = leadershipSignals;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}
