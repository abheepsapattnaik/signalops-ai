package com.signalopsai.backend.model;

public class LeadershipSignals {
    private int deliveryHealth;
    private String aiConfidence;
    private String riskTrend;

    public LeadershipSignals() {
    }

    public LeadershipSignals(int deliveryHealth, String aiConfidence, String riskTrend) {
        this.deliveryHealth = deliveryHealth;
        this.aiConfidence = aiConfidence;
        this.riskTrend = riskTrend;
    }

    public int getDeliveryHealth() {
        return deliveryHealth;
    }

    public void setDeliveryHealth(int deliveryHealth) {
        this.deliveryHealth = deliveryHealth;
    }

    public String getAiConfidence() {
        return aiConfidence;
    }

    public void setAiConfidence(String aiConfidence) {
        this.aiConfidence = aiConfidence;
    }

    public String getRiskTrend() {
        return riskTrend;
    }

    public void setRiskTrend(String riskTrend) {
        this.riskTrend = riskTrend;
    }
}
