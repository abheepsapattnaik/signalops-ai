package com.signalopsai.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.signalopsai.backend.entity.GeneratedInsight;
import com.signalopsai.backend.model.ArchitectureInsight;
import com.signalopsai.backend.model.InsightRequest;
import com.signalopsai.backend.model.InsightResponse;
import com.signalopsai.backend.model.LeadershipSignals;
import com.signalopsai.backend.model.RoadmapItem;
import com.signalopsai.backend.repository.GeneratedInsightRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class InsightService {

    private static final String DEFAULT_PROMPT =
            "We are scaling a platform organization and need to balance delivery speed, customer reliability, and AI-assisted decision quality while keeping costs and team capacity under control.";

    private final GeneratedInsightRepository generatedInsightRepository;
    private final RestTemplate restTemplate;
    private final AppSettingService appSettingService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${AI_API_KEY:}")
    private String aiApiKey;

    @Value("${AI_MODEL:openrouter/auto}")
    private String aiModel;

    @Value("${AI_BASE_URL:https://openrouter.ai/api/v1}")
    private String aiBaseUrl;

    public InsightService(GeneratedInsightRepository generatedInsightRepository,
                          RestTemplate restTemplate,
                          AppSettingService appSettingService) {
        this.generatedInsightRepository = generatedInsightRepository;
        this.restTemplate = restTemplate;
        this.appSettingService = appSettingService;
    }

    public InsightResponse generateInsight(InsightRequest request) {
        String prompt = request.getPrompt() == null || request.getPrompt().isBlank()
                ? DEFAULT_PROMPT
                : request.getPrompt().trim();
        String productIdea = request.getProductIdea() == null || request.getProductIdea().isBlank()
                ? "A platform that helps engineering teams triage incidents and improve operational clarity."
                : request.getProductIdea().trim();
        String team = request.getTeam() == null || request.getTeam().isBlank()
                ? "Platform & AI Ops"
                : request.getTeam();
        String requestedSource = normalizeSource(request.getSource());

        InsightResponse response;
        String finalSource;
        if (requestedSource.equalsIgnoreCase("LOCAL")) {
            response = buildInsight(prompt, productIdea, team, "local-heuristic");
            finalSource = "local-heuristic";
        } else {
            InsightResponse externalResponse = fetchAiAgentInsight(prompt, productIdea, team);
            if (externalResponse != null) {
                response = externalResponse;
                finalSource = "ai-agent";
            } else {
                response = buildInsight(prompt, productIdea, team, "local-heuristic");
                finalSource = "local-heuristic";
            }
        }

        GeneratedInsight entity = new GeneratedInsight(
                productIdea,
                prompt,
                team,
                response.getSummary(),
                response.getHealth(),
                response.getLeaderMessage(),
                finalSource
        );
        generatedInsightRepository.save(entity);

        return response;
    }

    private InsightResponse fetchAiAgentInsight(String prompt, String productIdea, String team) {
        String apiKey = resolveSetting("AI_API_KEY", aiApiKey);
        if (apiKey.isBlank()) {
            return null;
        }

        String normalizedBaseUrl = resolveSetting("AI_BASE_URL", aiBaseUrl);
        if (normalizedBaseUrl.isBlank()) {
            normalizedBaseUrl = "https://openrouter.ai/api/v1";
        }
        normalizedBaseUrl = normalizedBaseUrl.replaceAll("/+$", "");
        String url = normalizedBaseUrl + "/chat/completions";

        String model = resolveSetting("AI_MODEL", aiModel);
        if (model.isBlank()) {
            model = "openrouter/auto";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.add("HTTP-Referer", "http://localhost:3000");
        headers.add("X-Title", "SignalOps AI");

        Map<String, Object> payload = Map.of(
                "model", model,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content",
                                "You are an engineering leadership strategist. Return ONLY valid JSON with keys: summary, health, leaderMessage, roadmap, risks, recommendations, architecture, leadershipSignals. roadmap is an array of {title, rationale}. architecture must include systemDesign as a single paragraph and highLevelDesign and lowLevelDesign as arrays of concise bullets; this is the system design, HLD, and LLD structure. leadershipSignals must include deliveryHealth as a number, aiConfidence as a string, and riskTrend as a string. Use clear operational labels in systemDesign, not color words. Prefer labels like 'Watchlist:', 'Strong candidate:', or 'High risk:' instead of color names like 'Amber', 'Green', or 'Red'. Never return 'Amber' or any other color label in the systemDesign text. Keep the content grounded in software product and engineering strategy. Focus especially on the product idea and provide a practical system design, HLD, LLD, and leadership signals for it."
                        ),
                        Map.of(
                                "role", "user",
                                "content", "Team: " + team + "\nPrompt: " + prompt + "\nProduct idea: " + productIdea
                        )
                )
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return null;
            }

            Map<String, Object> responseBody = response.getBody();
            List<Map<String, Object>> choices = castListMap(responseBody.get("choices"));
            if (choices == null || choices.isEmpty()) {
                return null;
            }

            Map<String, Object> firstChoice = choices.get(0);
            Map<String, Object> message = castMap(firstChoice.get("message"));
            if (message == null) {
                return null;
            }

            String content = asString(message.get("content"));
            if (content == null || content.isBlank()) {
                return null;
            }

            JsonNode root = objectMapper.readTree(content);
            if (root != null && root.isTextual()) {
                content = root.textValue();
            }

            Map<String, Object> payloadMap = objectMapper.readValue(content, new TypeReference<>() {});
            return mapAiResponse(payloadMap);
        } catch (Exception ex) {
            return null;
        }
    }

    private InsightResponse mapAiResponse(Map<String, Object> payload) {
        InsightResponse response = new InsightResponse();
        response.setSummary(asString(payload.get("summary"), "The product strategy is well aligned with a measured roadmap and operating discipline."));
        response.setHealth(asString(payload.get("health"), "Stable"));
        response.setLeaderMessage(asString(payload.get("leaderMessage"), "The right AI strategy is to improve decision quality, not to remove ownership."));
        response.setRoadmap(parseRoadmap(payload.get("roadmap")));
        response.setRisks(parseStringList(payload.get("risks"), List.of(
                "Execution quality drifts when prioritization is driven by urgency instead of strategic value.")));
        response.setRecommendations(parseStringList(payload.get("recommendations"), List.of(
                "Standardize a single operating model for prioritization, including impact, risk, and effort scoring.")));
        response.setArchitecture(parseArchitecture(payload.get("architecture")));
        response.setLeadershipSignals(parseLeadershipSignals(payload.get("leadershipSignals")));
        response.setSource("ai-agent");

        if (response.getArchitecture() == null) {
            response.setArchitecture(new ArchitectureInsight());
        }
        if (response.getLeadershipSignals() == null) {
            response.setLeadershipSignals(new LeadershipSignals(82, "Medium", "Down 8%"));
        }

        return response;
    }

    private ArchitectureInsight parseArchitecture(Object value) {
        Map<String, Object> architecture = castMap(value);
        if (architecture == null) {
            return null;
        }

        ArchitectureInsight insight = new ArchitectureInsight();
        insight.setSystemDesign(asString(architecture.get("systemDesign"), "Strong candidate: a modular platform with clear ownership boundaries and measurable operational health."));
        insight.setHighLevelDesign(parseStringList(architecture.get("highLevelDesign"), List.of(
                "Client and API layer for user flows and secure authentication.",
                "Domain services for workflows, decision-making, and business logic.",
                "Shared data layer and operational dashboards for observability and reporting.")));
        insight.setLowLevelDesign(parseStringList(architecture.get("lowLevelDesign"), List.of(
                "Separate read-heavy and write-heavy paths to keep the request lifecycle predictable.",
                "Instrument application metrics and alerting early so reliability is built into the system from day one.",
                "Keep contracts explicit between services to support incremental platform evolution.")));
        return insight;
    }

    private LeadershipSignals parseLeadershipSignals(Object value) {
        Map<String, Object> leadershipSignals = castMap(value);
        if (leadershipSignals == null) {
            return null;
        }

        Object deliveryHealth = leadershipSignals.get("deliveryHealth");
        int health = deliveryHealth instanceof Number number ? number.intValue() : 82;
        String aiConfidence = asString(leadershipSignals.get("aiConfidence"), "Medium");
        String riskTrend = asString(leadershipSignals.get("riskTrend"), "Down 8%");
        return new LeadershipSignals(Math.max(0, Math.min(100, health)), aiConfidence, riskTrend);
    }

    private List<RoadmapItem> parseRoadmap(Object value) {
        List<Map<String, Object>> roadmapItems = castListMap(value);
        if (roadmapItems == null || roadmapItems.isEmpty()) {
            return List.of(
                    new RoadmapItem("AI-assisted backlog prioritization",
                            "Classify incoming work by customer impact, engineering cost, and delivery risk to reduce debate and improve predictability."),
                    new RoadmapItem("Proactive incident intelligence",
                            "Correlate alerts, ownership, and historical resolution patterns so teams resolve issues faster with less context switching."),
                    new RoadmapItem("Release confidence scoring",
                            "Blend quality signals, product risk, and change size to estimate rollout confidence before launch windows.")
            );
        }

        List<RoadmapItem> roadmap = new ArrayList<>();
        for (Map<String, Object> item : roadmapItems) {
            String title = asString(item.get("title"), "Milestone");
            String rationale = asString(item.get("rationale"), "Track the recommended operating priority.");
            roadmap.add(new RoadmapItem(title, rationale));
        }
        return roadmap;
    }

    private InsightResponse buildInsight(String prompt, String productIdea, String team, String source) {
        String normalizedIdea = productIdea.toLowerCase();

        ArchitectureInsight architecture = generateArchitecture(normalizedIdea);
        LeadershipSignals leadershipSignals = deriveLeadershipSignals(productIdea);

        InsightResponse response = new InsightResponse();
        response.setSummary(
                "The " + team + " function is positioned to improve delivery confidence by combining product context, platform signals, and AI-assisted prioritization."
        );
        response.setHealth("Stable, but not fully optimized");
        response.setLeaderMessage(
                "The right AI strategy is not automation for its own sake—it is faster decision quality, better prioritization, and more consistent execution across the engineering organization."
        );
        response.setArchitecture(architecture);
        response.setLeadershipSignals(leadershipSignals);
        response.setSource(source);

        List<RoadmapItem> roadmap = new ArrayList<>();
        roadmap.add(new RoadmapItem("AI-assisted backlog prioritization",
                "Classify incoming work by customer impact, engineering cost, and delivery risk to reduce debate and improve predictability."));
        roadmap.add(new RoadmapItem("Proactive incident intelligence",
                "Correlate alerts, ownership, and historical resolution patterns so teams resolve issues faster with less context switching."));
        roadmap.add(new RoadmapItem("Release confidence scoring",
                "Blend quality signals, product risk, and change size to estimate rollout confidence before launch windows."));
        response.setRoadmap(roadmap);

        List<String> risks = new ArrayList<>();
        risks.add("Execution quality drifts when prioritization is driven by urgency instead of strategic value.");
        risks.add("Operational signals may remain fragmented if ownership and context are not normalized across teams.");
        response.setRisks(risks);

        List<String> recommendations = new ArrayList<>();
        recommendations.add("Standardize a single operating model for prioritization, including impact, risk, and effort scoring.");
        recommendations.add("Use AI summaries to reduce onboarding time for incident triage and release blockers.");
        response.setRecommendations(recommendations);

        return response;
    }

    private ArchitectureInsight generateArchitecture(String productIdea) {
        ArchitectureInsight architecture = new ArchitectureInsight();

        if (productIdea.contains("ai") || productIdea.contains("assistant") || productIdea.contains("agent") || productIdea.contains("copilot")) {
            architecture.setSystemDesign("Watchlist: core AI workflow reliability and inference cost need hardening before broader autonomy across product teams.");
            architecture.setHighLevelDesign(List.of(
                    "User-facing client layer with authentication, context management, and workflow orchestration.",
                    "Application services for retrieval, summarization, and structured agent actions.",
                    "Model gateway with prompt templates, evaluation hooks, and cost controls."
            ));
            architecture.setLowLevelDesign(List.of(
                    "Persist conversations, prompts, and memory in dedicated application storage with clear retention policies.",
                    "Route model requests through a central gateway with guardrails and token budget monitoring.",
                    "Use asynchronous workers for summarization and indexing so user interactions remain responsive."
            ));
            return architecture;
        }

        if (productIdea.contains("marketplace") || productIdea.contains("checkout") || productIdea.contains("orders")) {
            architecture.setSystemDesign("Strong candidate: a multi-tenant marketplace platform with catalog, order, payment, and fulfillment boundaries provides a clean foundation for scale.");
            architecture.setHighLevelDesign(List.of(
                    "Catalog and discovery services for product metadata and recommendations.",
                    "Order and payment services for checkout, disputes, and ledger synchronization.",
                    "Fulfillment and observability services to manage delivery status and exception flows."
            ));
            architecture.setLowLevelDesign(List.of(
                    "Use idempotent order APIs to avoid duplicates during retries and payment failures.",
                    "Keep inventory and pricing in a consistent source-of-truth service with clear ownership boundaries.",
                    "Route notifications, shipping updates, and refunds through asynchronous workers."
            ));
            return architecture;
        }

        architecture.setSystemDesign("Strong candidate: a modular SaaS platform with separate service boundaries for user workflows, backend operations, and operational analytics will support incremental delivery.");
        architecture.setHighLevelDesign(List.of(
                "Client and API layer for user flows and secure authentication.",
                "Domain services for workflows, decision-making, and business logic.",
                "Shared data layer and operational dashboards for observability and reporting."
        ));
        architecture.setLowLevelDesign(List.of(
                "Separate read-heavy and write-heavy paths to keep the request lifecycle predictable.",
                "Instrument application metrics and alerting early so reliability is built into the system from day one.",
                "Keep contracts explicit between services to support incremental platform evolution."
        ));
        return architecture;
    }

    private LeadershipSignals deriveLeadershipSignals(String productIdea) {
        String idea = productIdea.toLowerCase();
        int deliveryHealth = 82;
        String aiConfidence = "Medium";
        String riskTrend = "Down 8%";

        if (idea.contains("marketplace") || idea.contains("payments") || idea.contains("checkout")) {
            deliveryHealth = 76;
            aiConfidence = "High";
            riskTrend = "Down 5%";
        } else if (idea.contains("realtime") || idea.contains("chat") || idea.contains("live") || idea.contains("stream")) {
            deliveryHealth = 74;
            aiConfidence = "Medium";
            riskTrend = "Up 4%";
        } else if (idea.contains("ai") || idea.contains("assistant") || idea.contains("agent") || idea.contains("ml") || idea.contains("llm")) {
            deliveryHealth = 88;
            aiConfidence = "High";
            riskTrend = "Down 11%";
        } else if (idea.contains("analytics") || idea.contains("dashboard") || idea.contains("signal")) {
            deliveryHealth = 86;
            aiConfidence = "High";
            riskTrend = "Down 10%";
        }

        if (idea.contains("risk") || idea.contains("security") || idea.contains("fraud") || idea.contains("payments")) {
            riskTrend = "Up 7%";
        }

        if (idea.contains("reliability") || idea.contains("incident") || idea.contains("alert") || idea.contains("uptime")) {
            aiConfidence = "Very high";
            deliveryHealth = Math.max(70, deliveryHealth - 2);
        }

        return new LeadershipSignals(deliveryHealth, aiConfidence, riskTrend);
    }

    private String normalizeSource(String source) {
        if (source == null) {
            return "AI";
        }
        return source.equalsIgnoreCase("LOCAL") ? "LOCAL" : "AI";
    }

    private String resolveSetting(String key, String fallbackValue) {
        String dbValue = appSettingService.getValue(key).orElse("");
        if (!dbValue.isBlank()) {
            return dbValue.trim();
        }
        return fallbackValue == null ? "" : fallbackValue.trim();
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> castMap(Object value) {
        if (value instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> castListMap(Object value) {
        if (value instanceof List<?> list) {
            List<Map<String, Object>> result = new ArrayList<>();
            for (Object item : list) {
                if (item instanceof Map<?, ?> map) {
                    result.add((Map<String, Object>) map);
                }
            }
            return result.isEmpty() ? null : result;
        }
        return null;
    }

    private static String asString(Object value) {
        return value == null ? null : String.valueOf(value).trim();
    }

    private static String asString(Object value, String defaultValue) {
        String result = asString(value);
        return (result == null || result.isBlank()) ? defaultValue : result;
    }

    private static List<String> parseStringList(Object value, List<String> fallback) {
        if (value instanceof List<?> list) {
            List<String> result = new ArrayList<>();
            for (Object item : list) {
                if (item != null) {
                    result.add(String.valueOf(item));
                }
            }
            return result.isEmpty() ? fallback : result;
        }
        return fallback;
    }

    private static List<String> parseStringList(Object value) {
        return parseStringList(value, Collections.emptyList());
    }
}
