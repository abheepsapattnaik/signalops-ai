package com.signalopsai.backend.model;

public class RoadmapItem {
    private String title;
    private String rationale;

    public RoadmapItem() {
    }

    public RoadmapItem(String title, String rationale) {
        this.title = title;
        this.rationale = rationale;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getRationale() {
        return rationale;
    }

    public void setRationale(String rationale) {
        this.rationale = rationale;
    }
}
