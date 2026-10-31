import type { AiInsight } from "./ai";

export type AiAgentConfig = {
  apiKey: string;
  model: string;
  baseUrl: string;
};

export function getAiAgentConfig(): AiAgentConfig | null {
  const apiKey = process.env.AI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    model: process.env.AI_MODEL?.trim() || "openrouter/auto",
    baseUrl: process.env.AI_BASE_URL?.trim() || "https://openrouter.ai/api/v1",
  };
}

function normalizeRiskLabel(value: string): string {
  const text = value.trim();
  if (!text) return text;

  return text.replace(/^(Amber|Green|Red)\s*:/i, (match, label) => {
    const normalized = label.toLowerCase();
    if (normalized === "amber") return "Watchlist:";
    if (normalized === "green") return "Strong candidate:";
    if (normalized === "red") return "High risk:";
    return match;
  });
}

export function normalizeInsight(payload: unknown): AiInsight | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const insight = payload as Record<string, unknown>;
  const summary = typeof insight.summary === "string" ? insight.summary : "";
  const health = typeof insight.health === "string" ? insight.health : "Stable";
  const leaderMessage = typeof insight.leaderMessage === "string" ? insight.leaderMessage : "";
  const roadmapRaw = Array.isArray(insight.roadmap) ? insight.roadmap : [];
  const risksRaw = Array.isArray(insight.risks) ? insight.risks : [];
  const recommendationsRaw = Array.isArray(insight.recommendations) ? insight.recommendations : [];

  const architectureRaw =
    insight.architecture && typeof insight.architecture === "object"
      ? (insight.architecture as Record<string, unknown>)
      : {};

  const leadershipSignalsRaw =
    insight.leadershipSignals && typeof insight.leadershipSignals === "object"
      ? (insight.leadershipSignals as Record<string, unknown>)
      : {};

  const roadmap = roadmapRaw
    .filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === "object")
    .map((entry) => ({
      title: typeof entry.title === "string" ? entry.title : "Milestone",
      rationale: typeof entry.rationale === "string" ? entry.rationale : "",
    }));

  const risks = risksRaw.map((item) => String(item));
  const recommendations = recommendationsRaw.map((item) => String(item));

  const systemDesign = normalizeRiskLabel(
    typeof architectureRaw.systemDesign === "string"
      ? architectureRaw.systemDesign
      : typeof insight.systemDesign === "string"
        ? insight.systemDesign
        : ""
  );

  const highLevelDesign = Array.isArray(architectureRaw.highLevelDesign)
    ? architectureRaw.highLevelDesign.map((item) => String(item))
    : Array.isArray(insight.highLevelDesign)
      ? insight.highLevelDesign.map((item) => String(item))
      : [];

  const lowLevelDesign = Array.isArray(architectureRaw.lowLevelDesign)
    ? architectureRaw.lowLevelDesign.map((item) => String(item))
    : Array.isArray(insight.lowLevelDesign)
      ? insight.lowLevelDesign.map((item) => String(item))
      : [];

  const rawDeliveryHealth =
    typeof leadershipSignalsRaw.deliveryHealth === "number"
      ? leadershipSignalsRaw.deliveryHealth
      : 82;
  const deliveryHealth = rawDeliveryHealth > 1 ? rawDeliveryHealth : rawDeliveryHealth * 100;

  const leadershipSignals = {
    deliveryHealth: Number.isFinite(deliveryHealth)
      ? Math.min(100, Math.max(0, deliveryHealth))
      : 82,
    aiConfidence:
      typeof leadershipSignalsRaw.aiConfidence === "string"
        ? leadershipSignalsRaw.aiConfidence
        : "Medium",
    riskTrend:
      typeof leadershipSignalsRaw.riskTrend === "string"
        ? leadershipSignalsRaw.riskTrend
        : "Down 8%",
  };

  if (!summary || !leaderMessage) {
    return null;
  }

  return {
    summary,
    health,
    leaderMessage,
    roadmap,
    risks,
    recommendations,
    architecture: {
      systemDesign,
      highLevelDesign,
      lowLevelDesign,
    },
    leadershipSignals,
  };
}

export async function fetchInsightFromAiAgent(
  prompt: string,
  team: string,
  productIdea: string
): Promise<AiInsight | null> {
  const config = getAiAgentConfig();
  if (!config) {
    return null;
  }

  const baseUrl = config.baseUrl.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://localhost:3000",
      "X-Title": "SignalOps AI",
    },
    body: JSON.stringify({
      model: config.model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an engineering leadership strategist. Return ONLY valid JSON with keys: summary, health, leaderMessage, roadmap, risks, recommendations, architecture, leadershipSignals. roadmap is an array of {title, rationale}. architecture must include systemDesign as a single paragraph and highLevelDesign and lowLevelDesign as arrays of concise bullets; this is the system design, HLD, and LLD structure. leadershipSignals must include deliveryHealth as a number, aiConfidence as a string, and riskTrend as a string. Use clear operational labels in systemDesign, not color words. Prefer labels like 'Watchlist:', 'Strong candidate:', or 'High risk:' instead of color names like 'Amber', 'Green', or 'Red'. Never return 'Amber' or any other color label in the systemDesign text. Keep the content grounded in software product and engineering strategy. Focus especially on the product idea and provide a practical system design, HLD, LLD, and leadership signals for it.",
        },
        {
          role: "user",
          content: `Team: ${team}\nPrompt: ${prompt}\nProduct idea: ${productIdea}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return null;
  }

  try {
    const cleanedContent = content
      .replace(/^```json\s*/i, "")
      .replace(/```$/i, "")
      .trim();
    const parsed = JSON.parse(cleanedContent) as unknown;
    return normalizeInsight(parsed);
  } catch {
    return null;
  }
}
