package com.signalopsai.backend.service;

import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class KeywordEmbeddingService implements EmbeddingService {

    private final Map<String, Double> termWeights = new ConcurrentHashMap<>();

    @Override
    public double[] embed(String value) {
        if (value == null || value.isBlank()) {
            return new double[0];
        }

        String[] tokens = value.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s]", " ")
                .trim()
                .split("\\s+");

        double[] vector = new double[Math.max(8, tokens.length)];
        for (int i = 0; i < tokens.length; i++) {
            String token = tokens[i].trim();
            if (token.isEmpty()) {
                continue;
            }
            double weight = 1.0 + (termWeights.computeIfAbsent(token, key -> Math.abs(key.hashCode()) % 17 + 1.0) / 10.0);
            vector[i % vector.length] += weight;
        }

        for (int i = 0; i < vector.length; i++) {
            vector[i] = Math.round(vector[i] * 100.0) / 100.0;
        }

        return vector;
    }
}
