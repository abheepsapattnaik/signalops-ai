"use client";

import { useEffect, useState } from "react";
import { DEFAULT_IDEA, DEFAULT_PROMPT } from "@/lib/insight-content";
import { DASHBOARD_COPY } from "@/lib/dashboard-content";

type RoadmapItem = {
  title: string;
  rationale: string;
};

type ArchitectureInsight = {
  systemDesign: string;
  highLevelDesign: string[];
  lowLevelDesign: string[];
};

type AiInsight = {
  summary: string;
  health: string;
  leaderMessage: string;
  roadmap: RoadmapItem[];
  risks: string[];
  recommendations: string[];
  architecture: ArchitectureInsight;
};

function deriveLeadershipSignals(idea: string) {
  const text = idea.toLowerCase();

  let deliveryHealth = 82;
  let aiConfidence = "Medium";
  let riskTrend = "Down 8%";

  if (/marketplace|payments|checkout|orders|booking/.test(text)) {
    deliveryHealth = 76;
    aiConfidence = "High";
    riskTrend = "Down 5%";
  } else if (/realtime|chat|live|presence|stream|video|audio/.test(text)) {
    deliveryHealth = 74;
    aiConfidence = "Medium";
    riskTrend = "Up 4%";
  } else if (/ai|assistant|ml|llm|recommendation|intelligence/.test(text)) {
    deliveryHealth = 88;
    aiConfidence = "High";
    riskTrend = "Down 11%";
  } else if (/analytics|dashboard|insights|signals|monitoring/.test(text)) {
    deliveryHealth = 86;
    aiConfidence = "High";
    riskTrend = "Down 10%";
  } else if (/wallet|finance|billing|ledger|transactions/.test(text)) {
    deliveryHealth = 72;
    aiConfidence = "High";
    riskTrend = "Down 6%";
  } else if (/social|community|feed|posts|followers/.test(text)) {
    deliveryHealth = 79;
    aiConfidence = "Medium";
    riskTrend = "Up 2%";
  }

  if (/risk|security|trust|fraud|payments/.test(text)) {
    riskTrend = "Up 7%";
  }

  if (/reliability|incident|alert|uptime/.test(text)) {
    aiConfidence = "Very high";
    deliveryHealth = Math.max(70, deliveryHealth - 2);
  }

  return {
    deliveryHealth,
    aiConfidence,
    riskTrend,
  };
}

export default function DashboardPage() {
  const [productIdea, setProductIdea] = useState(DEFAULT_IDEA);
  const [insight, setInsight] = useState<AiInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const leadershipSignals = deriveLeadershipSignals(productIdea);

  const loadInsight = async () => {
    setLoading(true);
    const ideaText = productIdea.trim();

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: DEFAULT_PROMPT,
        productIdea: ideaText,
        team: "Platform & AI Ops",
      }),
    });

    const data = (await response.json()) as AiInsight;
    setInsight(data);
    setLoading(false);
  };

  useEffect(() => {
    void loadInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-10 flex items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">{DASHBOARD_COPY.header.eyebrow}</p>
            <h1 className="mt-2 text-3xl font-semibold">{DASHBOARD_COPY.header.title}</h1>
          </div>
          <a
            href="/"
            className="rounded-full border border-cyan-400/50 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/10"
          >
            {DASHBOARD_COPY.header.backLink}
          </a>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/30">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-300">{DASHBOARD_COPY.productIdea.eyebrow}</p>
                <h2 className="mt-2 text-2xl font-semibold">{DASHBOARD_COPY.productIdea.title}</h2>
              </div>
              <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                {loading ? DASHBOARD_COPY.productIdea.status.analyzing : insight?.health ?? DASHBOARD_COPY.productIdea.status.live}
              </span>
            </div>

            <textarea
              value={productIdea}
              onChange={(event) => setProductIdea(event.target.value)}
              className="h-40 w-full rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-100 outline-none ring-0 transition focus:border-cyan-400"
            />

            <div className="mt-5 flex items-center justify-between gap-4">
              <p className="text-sm text-slate-300">{DASHBOARD_COPY.productIdea.description}</p>
              <button
                type="button"
                onClick={() => void loadInsight()}
                className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                {loading ? DASHBOARD_COPY.productIdea.button.generating : DASHBOARD_COPY.productIdea.button.default}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">{DASHBOARD_COPY.leadershipSignal.eyebrow}</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-slate-300">{DASHBOARD_COPY.leadershipSignal.deliveryHealth}</p>
                <p className="mt-2 text-4xl font-semibold">{leadershipSignals.deliveryHealth}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-300">{DASHBOARD_COPY.leadershipSignal.aiConfidence}</p>
                <p className="mt-2 text-4xl font-semibold">{leadershipSignals.aiConfidence}</p>
              </div>
              <div>
                <p className="text-sm text-slate-300">{DASHBOARD_COPY.leadershipSignal.riskTrend}</p>
                <p className="mt-2 text-4xl font-semibold">{leadershipSignals.riskTrend}</p>
              </div>
            </div>
          </div>
        </section>

        {insight && (
          <section className="mt-10 rounded-3xl border border-violet-400/20 bg-violet-500/5 p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-violet-300">{DASHBOARD_COPY.architecture.eyebrow}</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{DASHBOARD_COPY.architecture.title}</h2>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-violet-300">{DASHBOARD_COPY.architecture.cards.systemDesign}</p>
                <p className="mt-4 text-sm leading-7 text-slate-200">{insight.architecture.systemDesign}</p>
              </article>

              <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-violet-300">{DASHBOARD_COPY.architecture.cards.highLevelDesign}</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                  {insight.architecture.highLevelDesign.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-violet-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-violet-300">{DASHBOARD_COPY.architecture.cards.lowLevelDesign}</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                  {insight.architecture.lowLevelDesign.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-violet-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </section>
        )}

        {insight && (
          <section className="mt-10 grid gap-6 lg:grid-cols-3">
            <article className="rounded-3xl border border-white/10 bg-white/5 p-6 lg:col-span-2">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-300">{DASHBOARD_COPY.summary.eyebrow}</p>
              <p className="mt-4 text-lg leading-8 text-slate-100">{insight.summary}</p>

              <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">{DASHBOARD_COPY.summary.leaderMessage}</p>
                <p className="mt-3 text-base leading-7 text-cyan-50">{insight.leaderMessage}</p>
              </div>
            </article>

            <article className="rounded-3xl border border-amber-400/20 bg-amber-500/5 p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-amber-300">{DASHBOARD_COPY.risks.eyebrow}</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-100">
                {insight.risks.map((risk) => (
                  <li key={risk} className="flex gap-2">
                    <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        )}

        {insight && (
          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-300">{DASHBOARD_COPY.roadmap.eyebrow}</p>
              <div className="mt-5 space-y-4">
                {insight.roadmap.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <h3 className="text-base font-semibold text-cyan-200">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.rationale}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-300">{DASHBOARD_COPY.recommendations.eyebrow}</p>
              <ul className="mt-5 space-y-4">
                {insight.recommendations.map((recommendation) => (
                  <li key={recommendation} className="flex gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4 text-sm leading-6 text-slate-100">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        )}
      </div>
    </main>
  );
}
