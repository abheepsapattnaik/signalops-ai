"use client";

import { useEffect, useState } from "react";

type RoadmapItem = {
  title: string;
  rationale: string;
};

type AiInsight = {
  summary: string;
  health: string;
  leaderMessage: string;
  roadmap: RoadmapItem[];
  risks: string[];
  recommendations: string[];
};

const defaultPrompt =
  "We are scaling a platform organization and need to balance delivery speed, customer reliability, and AI-assisted decision quality while keeping costs and team capacity under control.";

export default function DashboardPage() {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [insight, setInsight] = useState<AiInsight | null>(null);
  const [loading, setLoading] = useState(true);

  const loadInsight = async (nextPrompt = prompt) => {
    setLoading(true);
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: nextPrompt,
        team: "Platform & AI Ops",
      }),
    });

    const data = (await response.json()) as AiInsight;
    setInsight(data);
    setLoading(false);
  };

  useEffect(() => {
    void loadInsight(defaultPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-10 flex items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">SignalOps AI</p>
            <h1 className="mt-2 text-3xl font-semibold">Leadership command center</h1>
          </div>
          <a
            href="/"
            className="rounded-full border border-cyan-400/50 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/10"
          >
            Back to overview
          </a>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/30">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-300">AI scenario</p>
                <h2 className="mt-2 text-2xl font-semibold">Engineering strategy prompt</h2>
              </div>
              <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                {loading ? "Analyzing" : insight?.health ?? "Live"}
              </span>
            </div>

            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="h-32 w-full rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-100 outline-none ring-0 transition focus:border-cyan-400"
            />

            <div className="mt-5 flex items-center justify-between gap-4">
              <p className="text-sm text-slate-300">
                Scenario designed to demonstrate AI-driven leadership decision making.
              </p>
              <button
                type="button"
                onClick={() => void loadInsight()}
                className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                {loading ? "Generating..." : "Generate insights"}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Leadership signal</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-slate-300">Delivery health</p>
                <p className="mt-2 text-4xl font-semibold">89%</p>
              </div>
              <div>
                <p className="text-sm text-slate-300">AI confidence</p>
                <p className="mt-2 text-4xl font-semibold">High</p>
              </div>
              <div>
                <p className="text-sm text-slate-300">Risk trend</p>
                <p className="mt-2 text-4xl font-semibold">Down 12%</p>
              </div>
            </div>
          </div>
        </section>

        {insight && (
          <section className="mt-10 grid gap-6 lg:grid-cols-3">
            <article className="rounded-3xl border border-white/10 bg-white/5 p-6 lg:col-span-2">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Summary</p>
              <p className="mt-4 text-lg leading-8 text-slate-100">{insight.summary}</p>

              <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Tech lead message</p>
                <p className="mt-3 text-base leading-7 text-cyan-50">{insight.leaderMessage}</p>
              </div>
            </article>

            <article className="rounded-3xl border border-amber-400/20 bg-amber-500/5 p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Execution risks</p>
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
              <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Roadmap</p>
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
              <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Recommendations</p>
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
