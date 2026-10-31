package com.signalopsai.backend.service;

import com.signalopsai.backend.entity.GeneratedInsight;
import com.signalopsai.backend.model.ArchitectureInsight;
import com.signalopsai.backend.model.InsightRequest;
import com.signalopsai.backend.model.InsightResponse;
import com.signalopsai.backend.model.LeadershipSignals;
import com.signalopsai.backend.model.RoadmapItem;
import com.signalopsai.backend.repository.GeneratedInsightRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class InsightService {

    private static final String DEFAULT_PROMPT =
            "We are scaling a platform organization and need to balance delivery speed, customer reliability, and AI-assisted decision quality while keeping costs and team capacity under control.";

    private final GeneratedInsightRepository generatedInsightRepository;

    public InsightService(GeneratedInsightRepository generatedInsightRepository) {
        this.generatedInsightRepository = generatedInsightRepository;
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
        String source = request.getSource() == null || request.getSource().equalsIgnoreCase("LOCAL")
                ? "local-heuristic"
                : "ai-agent";

        InsightResponse response = buildInsight(prompt, productIdea, team, source);

        GeneratedInsight entity = new GeneratedInsight(
                productIdea,
                prompt,
                team,
                response.getSummary(),
                response.getHealth(),
                response.getLeaderMessage(),
                source
        );
        generatedInsightRepository.save(entity);

        return response;
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
}
