export const DEFAULT_PROMPT =
  "We are scaling a platform organization and need to balance delivery speed, customer reliability, and AI-assisted decision quality while keeping costs and team capacity under control.";

export const FALLBACK_PROMPT =
  "We need a clearer AI-driven operating model for delivery and reliability.";

export const DEFAULT_IDEA =
  "A platform that helps engineering teams triage incidents, predict delivery risk, and surface leadership-ready operational recommendations in one dashboard.";

export const FALLBACK_AI_INSIGHT = {
  summary:
    "The AI guidance service encountered a temporary issue. Retry with a simpler prompt to continue the scenario.",
  health: "Needs attention",
  leaderMessage:
    "Even resilient systems occasionally fail, which is why the leadership model must include fallback processes and clear escalation paths.",
  roadmap: [],
  risks: ["The analysis service could not complete the requested turnaround."],
  recommendations: ["Retry the request with a shorter prompt and confirm the operating context."],
};

export const TEAM_CONTEXT = {
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
