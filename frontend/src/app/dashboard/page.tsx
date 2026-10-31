"use client";

import Link from "next/link";
import { useState } from "react";
import { deriveLeadershipSignals } from "@/lib/ai";
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

type LeadershipSignals = {
  deliveryHealth: number;
  aiConfidence: string;
  riskTrend: string;
};

type AiInsight = {
  summary: string;
  health: string;
  leaderMessage: string;
  roadmap: RoadmapItem[];
  risks: string[];
  recommendations: string[];
  architecture: ArchitectureInsight;
  leadershipSignals?: LeadershipSignals;
  source?: "ai-agent" | "local-heuristic";
};

type GenerationSource = "ai" | "local";

export default function DashboardPage() {
  const [productIdea, setProductIdea] = useState(DEFAULT_IDEA);
  const [insight, setInsight] = useState<AiInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [generationSource, setGenerationSource] = useState<GenerationSource>("ai");
  const leadershipSignals = insight?.leadershipSignals ?? deriveLeadershipSignals(productIdea);
  const aiSourceLabel = insight
    ? insight.source === "ai-agent"
      ? "AI agent"
      : "Local heuristic"
    : "Not started";

  const loadInsight = async () => {
    setLoading(true);
    const ideaText = productIdea.trim();

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "http://localhost:8080";

    const response = await fetch(`${backendUrl}/api/insights/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: DEFAULT_PROMPT,
        productIdea: ideaText,
        team: "Platform & AI Ops",
        source: generationSource,
      }),
    });

    const data = (await response.json()) as AiInsight;
    setInsight(data);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-10 flex items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
              {DASHBOARD_COPY.header.eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-50">
              {DASHBOARD_COPY.header.title}
            </h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-cyan-400/50 bg-cyan-500/5 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/10"
          >
            {DASHBOARD_COPY.header.backLink}
          </Link>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6 rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-[0_24px_80px_rgba(4,12,24,0.7)] ring-1 ring-cyan-500/10 lg:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-300">
                  {DASHBOARD_COPY.productIdea.eyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-semibold lg:text-[2rem]">
                  {DASHBOARD_COPY.productIdea.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  {loading
                    ? DASHBOARD_COPY.productIdea.status.analyzing
                    : (insight?.health ?? DASHBOARD_COPY.productIdea.status.live)}
                </span>
                <span className="rounded-full border border-violet-400/40 bg-violet-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-violet-200">
                  {loading ? "Preparing" : insight ? aiSourceLabel : "Awaiting"}
                </span>
              </div>
            </div>

            <textarea
              value={productIdea}
              onChange={(event) => setProductIdea(event.target.value)}
              className="min-h-[180px] w-full rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-base text-slate-100 outline-none ring-0 transition focus:border-cyan-400"
            />

            <div className="rounded-2xl border border-violet-400/20 bg-violet-500/5 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] uppercase tracking-[0.25em] text-violet-200/80">
                  Insight source
                </p>
                <div className="inline-flex rounded-full border border-violet-400/30 bg-slate-950/40 p-1">
                  {(
                    [
                      { value: "ai", label: "AI agent" },
                      { value: "local", label: "Local" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGenerationSource(option.value)}
                      className={`rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] transition ${
                        generationSource === option.value
                          ? "bg-violet-500 text-white"
                          : "text-violet-200/80 hover:text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-100">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    loading
                      ? "bg-amber-400"
                      : !insight
                        ? "bg-slate-500"
                        : aiSourceLabel === "AI agent"
                          ? "bg-emerald-400"
                          : "bg-violet-400"
                  }`}
                />
                <span>
                  {loading
                    ? generationSource === "ai"
                      ? "Preparing AI analysis..."
                      : "Preparing local analysis..."
                    : !insight
                      ? "Awaiting generate insights"
                      : aiSourceLabel === "AI agent"
                        ? "AI agent response"
                        : "Local heuristic fallback"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-sm leading-6 text-slate-300">
                {DASHBOARD_COPY.productIdea.description}
              </p>
              <button
                type="button"
                onClick={() => void loadInsight()}
                className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      generationSource === "ai" ? "bg-emerald-500" : "bg-violet-500"
                    }`}
                  />
                  {loading
                    ? DASHBOARD_COPY.productIdea.button.generating
                    : `${DASHBOARD_COPY.productIdea.button.default} (${generationSource === "ai" ? "AI" : "Local"})`}
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-[30px] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-slate-900/85 to-slate-900 p-6 shadow-[0_20px_60px_rgba(14,116,144,0.15)] lg:p-7">
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
              {DASHBOARD_COPY.leadershipSignal.eyebrow}
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-sm text-slate-300">
                  {DASHBOARD_COPY.leadershipSignal.deliveryHealth}
                </p>
                <p className="mt-3 text-4xl font-semibold leading-none text-white">
                  {Math.round(leadershipSignals.deliveryHealth)}%
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-sm text-slate-300">
                  {DASHBOARD_COPY.leadershipSignal.aiConfidence}
                </p>
                <p className="mt-3 text-xl font-semibold leading-snug text-white">
                  {leadershipSignals.aiConfidence}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-sm text-slate-300">
                  {DASHBOARD_COPY.leadershipSignal.riskTrend}
                </p>
                <p className="mt-3 text-xl font-semibold leading-snug text-white">
                  {leadershipSignals.riskTrend}
                </p>
              </div>
            </div>
          </div>
        </section>

        {insight && (
          <section className="mt-10 rounded-3xl border border-violet-400/20 bg-violet-500/5 p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-violet-300">
                  {DASHBOARD_COPY.architecture.eyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white lg:text-[2rem]">
                  {DASHBOARD_COPY.architecture.title}
                </h2>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-violet-300">
                  {DASHBOARD_COPY.architecture.cards.systemDesign}
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-200">
                  {insight.architecture.systemDesign}
                </p>
              </article>

              <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-violet-300">
                  {DASHBOARD_COPY.architecture.cards.highLevelDesign}
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                  {insight.architecture.highLevelDesign.map((item, index) => (
                    <li key={`${item}-${index}`} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-violet-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-violet-300">
                  {DASHBOARD_COPY.architecture.cards.lowLevelDesign}
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                  {insight.architecture.lowLevelDesign.map((item, index) => (
                    <li key={`${item}-${index}`} className="flex gap-3">
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
              <p className="text-xs uppercase tracking-[0.25em] text-slate-300">
                {DASHBOARD_COPY.summary.eyebrow}
              </p>
              <p className="mt-4 text-lg leading-8 text-slate-100">{insight.summary}</p>

              <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                  {DASHBOARD_COPY.summary.leaderMessage}
                </p>
                <p className="mt-3 text-base leading-7 text-cyan-50">{insight.leaderMessage}</p>
              </div>
            </article>

            <article className="rounded-3xl border border-amber-400/20 bg-amber-500/5 p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-amber-300">
                {DASHBOARD_COPY.risks.eyebrow}
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-100">
                {insight.risks.map((risk, index) => (
                  <li key={`${risk}-${index}`} className="flex gap-2">
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
              <p className="text-xs uppercase tracking-[0.25em] text-slate-300">
                {DASHBOARD_COPY.roadmap.eyebrow}
              </p>
              <div className="mt-5 space-y-4">
                {insight.roadmap.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <h3 className="text-base font-semibold text-cyan-200">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.rationale}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-300">
                {DASHBOARD_COPY.recommendations.eyebrow}
              </p>
              <ul className="mt-5 space-y-4">
                {insight.recommendations.map((recommendation, index) => (
                  <li
                    key={`${recommendation}-${index}`}
                    className="flex gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4 text-sm leading-6 text-slate-100"
                  >
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
