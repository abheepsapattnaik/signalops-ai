package com.signalopsai.backend.model;

import java.util.ArrayList;
import java.util.List;

public class ArchitectureInsight {
    private String systemDesign = "";
    private List<String> highLevelDesign = new ArrayList<>();
    private List<String> lowLevelDesign = new ArrayList<>();

    public String getSystemDesign() {
        return systemDesign;
    }

    public void setSystemDesign(String systemDesign) {
        this.systemDesign = systemDesign;
    }

    public List<String> getHighLevelDesign() {
        return highLevelDesign;
    }

    public void setHighLevelDesign(List<String> highLevelDesign) {
        this.highLevelDesign = highLevelDesign;
    }

    public List<String> getLowLevelDesign() {
        return lowLevelDesign;
    }

    public void setLowLevelDesign(List<String> lowLevelDesign) {
        this.lowLevelDesign = lowLevelDesign;
    }
}
