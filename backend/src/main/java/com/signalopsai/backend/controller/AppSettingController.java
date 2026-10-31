package com.signalopsai.backend.controller;

import com.signalopsai.backend.service.AppSettingService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AppSettingController {

    private final AppSettingService appSettingService;

    public AppSettingController(AppSettingService appSettingService) {
        this.appSettingService = appSettingService;
    }

    @GetMapping("/settings/{key}")
    public ResponseEntity<Map<String, Object>> getSetting(@PathVariable String key) {
        String value = appSettingService.getValue(key).orElse("");
        return ResponseEntity.ok(Map.of(
                "key", key,
                "value", value,
                "configured", !value.isBlank()
        ));
    }

    @PostMapping("/settings")
    public ResponseEntity<Map<String, Object>> saveSetting(@RequestBody SettingRequest request) {
        if (request == null || request.key == null || request.key.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Setting key is required"));
        }

        appSettingService.setValue(request.key, request.value == null ? "" : request.value);
        return ResponseEntity.ok(Map.of(
                "key", request.key,
                "configured", !(request.value == null || request.value.isBlank())
        ));
    }

    public static class SettingRequest {
        @NotBlank
        public String key;
        public String value;
    }
}
