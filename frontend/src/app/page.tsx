import Link from "next/link";

const highlightCards = [
  {
    label: "AI-assisted decisions",
    value: "90%",
    description: "Improve clarity across operational noise and roadmap trade-offs.",
  },
  {
    label: "Delivery confidence",
    value: "4.8/5",
    description: "Balance quality, speed, and platform risk before launch.",
  },
  {
    label: "Leadership impact",
    value: "3x",
    description: "Faster cross-functional decision making across engineering and product teams.",
  },
];

const featureItems = [
  "AI-driven incident summaries and action guidance",
  "Roadmap prioritization with risk-to-value scoring",
  "Operational command center for leadership visibility",
  "Clear narrative for full-stack and AI interview discussions",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="flex items-center justify-between gap-4 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400 text-sm font-bold text-slate-950">
              S
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.25em] text-cyan-300">SIGNALOPS</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#solution" className="transition hover:text-white">
              Solution
            </a>
            <a href="#architecture" className="transition hover:text-white">
              Architecture
            </a>
            <a href="#story" className="transition hover:text-white">
              Interview story
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
            >
              Open chat
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Open demo
            </Link>
          </div>
        </header>

        <section className="grid items-center gap-10 pb-16 pt-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-300">
              AI portfolio project
            </p>
            <h1 className="max-w-xl text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl">
              Building the next generation of operational intelligence.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              SignalOps AI is a leadership-grade platform that brings full-stack engineering, AI
              workflows, and strategic decision support together into one interview-ready project.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="rounded-full bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                View AI dashboard
              </Link>
              <a
                href="#story"
                className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white transition hover:bg-white/5"
              >
                See interview story
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950 p-6 shadow-2xl shadow-cyan-950/30">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Operational pulse
              </p>
              <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                healthy
              </span>
            </div>
            <div className="mt-8 grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">AI guidance</p>
                <p className="mt-3 text-3xl font-semibold">Prioritize with confidence</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Latency</p>
                  <p className="mt-3 text-2xl font-semibold">142ms</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Risk score</p>
                  <p className="mt-3 text-2xl font-semibold">Low</p>
                </div>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
                <div className="flex items-center justify-between text-sm text-cyan-100">
                  <span>Autonomous review cycle</span>
                  <span>72%</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="solution" className="py-8">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">What this solves</p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {highlightCards.map((card) => (
              <article
                key={card.label}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <p className="text-sm text-slate-300">{card.label}</p>
                <p className="mt-3 text-4xl font-semibold text-white">{card.value}</p>
                <p className="mt-4 text-sm leading-6 text-slate-300">{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="architecture" className="py-16">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Architecture</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">
              Built as a full-stack AI product, not just a toy app.
            </h2>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
              <h3 className="text-xl font-semibold text-white">Core stack</h3>
              <ul className="mt-5 space-y-4 text-slate-300">
                <li>• Next.js app router for a polished UX and scalable frontend structure.</li>
                <li>• TypeScript for maintainable, experienced engineering decisions.</li>
                <li>• Tailwind UI for a product-grade design system.</li>
                <li>• API route layer to simulate AI-driven operational insight generation.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
              <h3 className="text-xl font-semibold text-white">Leadership value</h3>
              <ul className="mt-5 space-y-4 text-slate-300">
                <li>
                  • Connect customer experience, engineering health, and platform optimization.
                </li>
                <li>• Turn decision-making into a repeatable operating model.</li>
                <li>
                  • Demonstrate how AI is used to reduce cognitive load, not replace judgment.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="story" className="py-16">
          <div className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-slate-900 p-8">
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Interview story</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">
              Why this matters for a tech lead interview
            </h2>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-lg leading-8 text-slate-200">
                  This project showcases the ability to combine product sense, systems thinking, and
                  AI-enabled execution. It demonstrates that I can translate operational complexity
                  into a simple decision layer for teams while keeping engineering quality and
                  customer impact front and center.
                </p>
              </div>
              <ul className="space-y-3 text-slate-200">
                {featureItems.map((item, index) => (
                  <li
                    key={`${item}-${index}`}
                    className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                  >
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
