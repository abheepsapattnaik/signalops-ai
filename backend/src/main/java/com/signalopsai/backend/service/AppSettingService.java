package com.signalopsai.backend.service;

import com.signalopsai.backend.entity.AppSetting;
import com.signalopsai.backend.repository.AppSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AppSettingService {

    private final AppSettingRepository appSettingRepository;

    public AppSettingService(AppSettingRepository appSettingRepository) {
        this.appSettingRepository = appSettingRepository;
    }

    public Optional<String> getValue(String key) {
        return appSettingRepository.findByKey(normalizeKey(key))
                .map(AppSetting::getValue)
                .filter(value -> value != null && !value.isBlank());
    }

    @Transactional
    public void setValue(String key, String value) {
        String normalizedKey = normalizeKey(key);
        String normalizedValue = value == null ? "" : value.trim();

        AppSetting setting = appSettingRepository.findByKey(normalizedKey)
                .orElseGet(() -> new AppSetting(normalizedKey, normalizedValue));

        setting.setValue(normalizedValue);
        setting.setUpdatedAt(LocalDateTime.now());
        appSettingRepository.save(setting);
    }

    public String getRequiredValue(String key, String fallback) {
        return getValue(key).orElse(fallback);
    }

    private String normalizeKey(String key) {
        return key == null ? "" : key.trim();
    }
}
