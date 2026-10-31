import { TEAM_CONTEXT } from "./insight-content";

export type RoadmapItem = {
  title: string;
  rationale: string;
};

export type ArchitectureInsight = {
  systemDesign: string;
  highLevelDesign: string[];
  lowLevelDesign: string[];
};

export function generateArchitectureFromIdea(idea: string): ArchitectureInsight {
  const cleanedIdea = idea.trim().toLowerCase();
  const isAiProduct = /ai|assistant|chat|agent|copilot|llm|recommendation|intelligence/.test(
    cleanedIdea
  );
  const isMarketplace = /marketplace|commerce|seller|buyer|orders|checkout|catalog/.test(
    cleanedIdea
  );
  const isRealtime = /realtime|live|chat|stream|presence|websocket|video|audio/.test(cleanedIdea);
  const isAnalytics = /dashboard|analytics|insights|report|signal|metrics|monitoring/.test(
    cleanedIdea
  );
  const isFintech = /payments|wallet|bank|ledger|transaction|finance|billing/.test(cleanedIdea);
  const isSocial = /social|community|network|feed|posts|followers|events/.test(cleanedIdea);

  if (isAiProduct) {
    return {
      systemDesign:
        "A modular AI product architecture with client apps, orchestration service, model gateway, retrieval layer, and evaluation pipeline. The system keeps user context, business rules, and LLM outputs separately so the product can evolve without coupling AI behavior to the UI.",
      highLevelDesign: [
        "Client layer: web/mobile interfaces, authentication, and user context orchestration.",
        "Application layer: business services for chat, workflow automation, and recommendation generation.",
        "AI layer: model routing, prompt templates, retrieval, guardrails, and evaluation hooks.",
        "Data layer: vector store for memory/search, transactional database for user data, and event logs for observability.",
      ],
      lowLevelDesign: [
        "Expose REST or streaming APIs for chat, search, workflow execution, and intent classification.",
        "Persist user sessions, prompts, and outputs in a relational store while storing long-tail embeddings in a vector database.",
        "Use background workers for summarization, indexing, and asynchronous AI tasks so the user experience stays responsive.",
        "Add prompt templates, rate limits, safety checks, and cost tracking to keep model usage predictable and governable.",
      ],
    };
  }

  if (isMarketplace) {
    return {
      systemDesign:
        "A multi-tenant marketplace platform with product catalog, buyer/seller workflows, payments, and fulfillment orchestration. The design prioritizes trust, transaction safety, and inventory consistency across distributed services.",
      highLevelDesign: [
        "Catalog and discovery services for listing, search, and pricing.",
        "Order and identity services for checkout, payments, and buyer/seller trust.",
        "Fulfillment and event services that coordinate shipping, notifications, and support traffic.",
        "Monitoring and fraud controls around payment flows, abuse patterns, and inventory mismatches.",
      ],
      lowLevelDesign: [
        "Normalize product metadata and inventory counts into a source-of-truth catalog service.",
        "Use idempotent order APIs and transactional writes to avoid duplicate payment or fulfillment events.",
        "Introduce worker queues for order status updates, email/SMS notifications, and downstream logistics integration.",
        "Add rate limits, anti-fraud logic, and audit trails for every high-value payment or storefront action.",
      ],
    };
  }

  if (isRealtime) {
    return {
      systemDesign:
        "A real-time event-driven platform optimized for low latency, connection management, and concurrency. The architecture centers on a pub/sub event backbone, persistent presence tracking, and lightweight stateful services for live interactions.",
      highLevelDesign: [
        "Presence and connection services to manage user sessions and live channels.",
        "Event bus for fan-out delivery of messages, updates, and notifications.",
        "Stateful application services for chat, collaboration, and presence-aware workflows.",
        "Observability around latency, message throughput, and real-time failure recovery.",
      ],
      lowLevelDesign: [
        "Use WebSockets or server-sent events for interactive client updates and heartbeat health checks.",
        "Store short-lived state in Redis or a similar fast data layer while persisting durable conversation records in a relational store.",
        "Apply backpressure controls and message acknowledgements to prevent dropped updates during burst traffic.",
        "Track latency budgets and event ordering rules so user experience remains coherent during spikes.",
      ],
    };
  }

  if (isAnalytics) {
    return {
      systemDesign:
        "A data-rich analytics platform combining event ingestion, transformation pipelines, and executive dashboards. The best design supports both real-time operational views and long-term trend analysis without creating a brittle reporting stack.",
      highLevelDesign: [
        "Ingestion services for telemetry and business events from web/mobile systems.",
        "Transformation and semantic modeling layer to normalize raw data into analytic dimensions and metrics.",
        "Dashboard and alerting services for operations, product, and leadership decision making.",
        "Governance services to maintain quality checks, retention policies, and metric definitions.",
      ],
      lowLevelDesign: [
        "Use event schemas and versioned contracts so pipeline changes do not break downstream dashboard consumers.",
        "Store raw events in a data lake or warehouse, with curated aggregates for faster dashboard queries.",
        "Introduce scheduled data quality checks and alerting when metric drift or stale data is detected.",
        "Keep a small number of leader-level KPIs synchronized with operational metrics so stakeholders trust the dashboards.",
      ],
    };
  }

  if (isFintech) {
    return {
      systemDesign:
        "A secure transactional architecture built around identity, ledger consistency, and policy enforcement. The system must prioritize auditability, idempotency, and explicit approval flows because trust and correctness matter more than raw speed.",
      highLevelDesign: [
        "Identity and access services for user onboarding, authentication, and role management.",
        "Ledger and transaction orchestration for balances, payment events, and settlement flows.",
        "Risk and compliance checks around anti-fraud rules, approval thresholds, and audit logs.",
        "Reporting and reconciliation services to compare internal state with external ledger outcomes.",
      ],
      lowLevelDesign: [
        "Use durable writes and transactional consistency for every money movement event.",
        "Build idempotent APIs so retries do not result in duplicate charges or duplicate ledger entries.",
        "Store immutable audit logs and approval metadata to support investigations and compliance reviews.",
        "Separate read replicas from write paths so reporting can scale without weakening transaction guarantees.",
      ],
    };
  }

  if (isSocial) {
    return {
      systemDesign:
        "A social platform architecture centered on feed generation, identity, content moderation, and scale-efficient recommendation logic. The design balances freshness, discovery, and trust through modular content and graph services.",
      highLevelDesign: [
        "User and identity services for profiles, followers, and authorization flows.",
        "Content and feed services that generate personalized timelines and engagement ranking.",
        "Moderation and trust services for abuse detection, reporting, and policy enforcement.",
        "Recommendation and analytics services to improve content relevance and retention.",
      ],
      lowLevelDesign: [
        "Separate authoring, moderation, and feed generation so content can be processed asynchronously without blocking writes.",
        "Persist graph relationships and user activity in scalable data stores while denormalizing feed data for fast retrieval.",
        "Use ranking heuristics and recommendation logic to score content based on relevance, freshness, and user affinity.",
        "Add abuse detection pipelines and escalation workflows to keep user trust strong as the platform scales.",
      ],
    };
  }

  return {
    systemDesign:
      "A SaaS-style modular architecture with clear service boundaries: client app, API layer, domain services, data layer, and orchestration utilities. This design is the best starting point when the product goal is speed-to-market without overengineering from day one.",
    highLevelDesign: [
      "Frontend service for user flows, product experience, and onboarding.",
      "Core domain services for business logic, authorization, and workflow orchestration.",
      "Shared data layer for user records, application state, and operational analytics.",
      "Enabling services for notifications, background jobs, and platform observability.",
    ],
    lowLevelDesign: [
      "Define domain-model boundaries and write clear contracts for every API before implementation starts.",
      "Keep read-heavy operations separate from write-heavy services to improve performance and operational clarity.",
      "Use event-driven background processing for non-critical tasks so the core request path remains fast and resilient.",
      "Instrument the app with logs, metrics, and alerts from the first build to support iteration and incident response.",
    ],
  };
}

export type AiInsight = {
  summary: string;
  health: string;
  leaderMessage: string;
  roadmap: RoadmapItem[];
  risks: string[];
  recommendations: string[];
  architecture: ArchitectureInsight;
};

export function generateAiInsight(
  prompt: string,
  team: string = "Platform & AI Ops",
  productIdea?: string
): AiInsight {
  const cleanedPrompt = prompt.trim() || "delivery and reliability leadership";
  const cleanedProductIdea = productIdea?.trim() || cleanedPrompt;
  const text = cleanedPrompt.toLowerCase();
  const ideaText = cleanedProductIdea.toLowerCase();
  const isDeliveryFocused = /delivery|release|launch|roadmap|velocity|backlog|priority/.test(text);
  const isReliabilityFocused = /incident|uptime|sre|stability|outage|reliability|alert/.test(text);
  const isProductFocused = /customer|insight|ux|experience|product|value|impact/.test(text);
  const isTeamFocused = /team|people|capacity|leadership|org|ownership|execution/.test(text);

  const summaryFragments = [
    `The ${team} function is positioned for stronger operating leverage, with AI used to compress decision cycles and bring clarity to noisy operational data.`,
    isDeliveryFocused
      ? "The strongest opportunity is optimizing roadmap prioritization so execution stays aligned to strategic value and delivery confidence."
      : "The strongest opportunity is improving visibility across product, engineering, and operational signals so leaders can prioritize the highest impact work.",
    isReliabilityFocused
      ? "Reliability signals can be transformed into predictive guidance, reducing alert fatigue and improving mean time to resolution."
      : "Operational telemetry can be distilled into a smaller set of actionable recommendations rather than raw dashboards.",
    isProductFocused
      ? "Customer-facing quality and product outcomes should remain at the center of any AI-driven recommendation engine."
      : "A balanced scorecard should tie engineering decisions back to customer value, platform quality, and delivery risk.",
  ];

  const roadmap = [...TEAM_CONTEXT.roadmap];
  if (isTeamFocused) {
    roadmap.unshift({
      title: "Leadership operating rhythm",
      rationale:
        "Create weekly AI-assisted review loops that align roadmaps, risks, and trade-offs across engineering, product, and customer support.",
    });
  }

  const risks = [...TEAM_CONTEXT.risks];
  if (isReliabilityFocused) {
    risks.unshift(
      "Incidents are likely to recur when alert correlation is incomplete and ownership signals are not consistent."
    );
  }

  const recommendations = [...TEAM_CONTEXT.recommendations];
  if (isDeliveryFocused) {
    recommendations.unshift(
      "Use AI to highlight release blockers, dependencies, and sequencing risks before a launch decision is made."
    );
  }
  if (isProductFocused) {
    recommendations.unshift(
      "Pair AI-generated recommendations with product feedback loops so engineering trade-offs stay grounded in user impact."
    );
  }

  const ideaArchitecture = generateArchitectureFromIdea(ideaText);
  const systemDesign = ideaArchitecture.systemDesign;
  const highLevelDesign = ideaArchitecture.highLevelDesign;
  const lowLevelDesign = ideaArchitecture.lowLevelDesign;

  return {
    summary: summaryFragments.join(" "),
    health: "Stable, but not fully optimized",
    leaderMessage:
      "The right AI strategy is not automation for its own sake—it is faster decision quality, better prioritization, and more consistent execution across the engineering organization.",
    roadmap,
    risks,
    recommendations,
    architecture: {
      systemDesign,
      highLevelDesign,
      lowLevelDesign,
    },
  };
}
