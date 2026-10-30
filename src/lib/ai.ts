export type RoadmapItem = {
  title: string;
  rationale: string;
};

export type AiInsight = {
  summary: string;
  health: string;
  leaderMessage: string;
  roadmap: RoadmapItem[];
  risks: string[];
  recommendations: string[];
};

const teamContext = {
  summary:
    "This platform is maintaining strong delivery velocity while the biggest risk is operational scale, decision latency, and inconsistent prioritization across teams.",
  roadmap: [
    {
      title: "AI-assisted backlog prioritization",
      rationale:
        "Classify incoming work by customer impact, engineering cost, and delivery risk to reduce debate and improve predictability.",
    },
    {
      title: "Proactive incident intelligence",
      rationale:
        "Correlate alerts, ownership, and historical resolution patterns so engineers resolve issues faster with less context switching.",
    },
    {
      title: "Release confidence scoring",
      rationale:
        "Blend quality signals, product risk, and change size to estimate rollout confidence before launch windows.",
    },
  ],
  risks: [
    "Decision quality drifts when prioritization is driven by urgency instead of strategic value.",
    "SRE and product teams operate from fragmented signals, creating inconsistent execution.",
    "Change risk rises as more features are launched without a clear confidence model.",
  ],
  recommendations: [
    "Standardize a single operating model for prioritization, including impact, risk, and effort scoring.",
    "Use AI summaries to reduce onboarding time for incident triage and release blockers.",
    "Create a leadership dashboard with trend-based metrics so stakeholders can act on signals before they become escalations.",
  ],
};

export function generateAiInsight(prompt: string, team: string = "Platform & AI Ops"): AiInsight {
  const cleanedPrompt = prompt.trim() || "delivery and reliability leadership";
  const text = cleanedPrompt.toLowerCase();
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

  const roadmap = [...teamContext.roadmap];
  if (isTeamFocused) {
    roadmap.unshift({
      title: "Leadership operating rhythm",
      rationale: "Create weekly AI-assisted review loops that align roadmaps, risks, and trade-offs across engineering, product, and customer support.",
    });
  }

  const risks = [...teamContext.risks];
  if (isReliabilityFocused) {
    risks.unshift("Incidents are likely to recur when alert correlation is incomplete and ownership signals are not consistent.");
  }

  const recommendations = [...teamContext.recommendations];
  if (isDeliveryFocused) {
    recommendations.unshift("Use AI to highlight release blockers, dependencies, and sequencing risks before a launch decision is made.");
  }
  if (isProductFocused) {
    recommendations.unshift("Pair AI-generated recommendations with product feedback loops so engineering trade-offs stay grounded in user impact.");
  }

  return {
    summary: summaryFragments.join(" "),
    health: "Stable, but not fully optimized",
    leaderMessage:
      "The right AI strategy is not automation for its own sake—it is faster decision quality, better prioritization, and more consistent execution across the engineering organization.",
    roadmap,
    risks,
    recommendations,
  };
}
