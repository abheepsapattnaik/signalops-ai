package com.signalopsai.backend.controller;

import com.signalopsai.backend.model.InsightRequest;
import com.signalopsai.backend.model.InsightResponse;
import com.signalopsai.backend.service.InsightService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class InsightController {

    private final InsightService insightService;

    public InsightController(InsightService insightService) {
        this.insightService = insightService;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }

    @PostMapping("/ai")
    public ResponseEntity<InsightResponse> generateAiInsight(@Valid @RequestBody InsightRequest request) {
        return ResponseEntity.ok(insightService.generateInsight(request));
    }

    @PostMapping("/insights/generate")
    public ResponseEntity<InsightResponse> generateInsight(@Valid @RequestBody InsightRequest request) {
        return ResponseEntity.ok(insightService.generateInsight(request));
    }
}
