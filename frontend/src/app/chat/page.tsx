"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type ChatMessage = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  references?: string;
  createdAt?: string;
};

type ChatSession = {
  id: string;
  title: string;
  userId: string;
};

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "http://localhost:8080";

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("What are our escalation steps for a production issue?");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [knowledgeTitle, setKnowledgeTitle] = useState("Operations handbook");
  const [knowledgeType, setKnowledgeType] = useState("manual");
  const [knowledgeContent, setKnowledgeContent] = useState(
    "Escalate production issues through the incident commander within 15 minutes. Capture all customer impact, ownership, and mitigation steps in the incident log. If a Sev-1 issue affects a customer-facing workflow, page the on-call owner and notify product and leadership."
  );
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);

  const fetchMessages = async (activeSessionId: string): Promise<ChatMessage[]> => {
    const response = await fetch(`${backendUrl}/api/chat/sessions/${activeSessionId}/messages`);
    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as ChatMessage[];
    return data.map((message) => ({
      ...message,
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content ?? "",
    }));
  };

  const createSession = async (title = "Private knowledge chat") => {
    try {
      const response = await fetch(`${backendUrl}/api/chat/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          userId: "local-user",
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to create a chat session");
      }

      const session = (await response.json()) as ChatSession;
      setSessions((existing) => {
        if (existing.some((item) => item.id === session.id)) {
          return existing;
        }
        return [session, ...existing];
      });
      setCurrentSessionId(session.id);
      const history = await fetchMessages(session.id);
      setMessages(history);
      return session.id;
    } catch (chatError) {
      setError(chatError instanceof Error ? chatError.message : "Unable to start chat");
      return null;
    }
  };

  useEffect(() => {
    void createSession();
  }, []);

  const selectSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    const history = await fetchMessages(sessionId);
    setMessages(history);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentSessionId || !input.trim()) {
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSessionId,
          userId: "local-user",
          message: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to send message to the backend chat service");
      }

      const payload = (await response.json()) as {
        sessionId: string;
        answer: string;
        sources: string[];
      };

      const refreshedHistory = await fetchMessages(currentSessionId);
      setMessages(refreshedHistory);

      if (payload.answer) {
        setMessages((previous) => [
          ...previous,
          { role: "user", content: userMessage },
          {
            role: "assistant",
            content: payload.answer,
            references: payload.sources.join(", "),
          },
        ]);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleIngestKnowledge = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!knowledgeTitle.trim() || !knowledgeContent.trim()) {
      setIngestStatus("Document title and content are required.");
      return;
    }

    const params = new URLSearchParams({
      title: knowledgeTitle.trim(),
      sourceType: knowledgeType,
      content: knowledgeContent.trim(),
    });

    try {
      const response = await fetch(`${backendUrl}/api/chat/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error("Unable to ingest the document into the knowledge base");
      }

      setIngestStatus(`Ingested "${knowledgeTitle.trim()}" successfully.`);
      setKnowledgeTitle("");
      setKnowledgeContent("");
    } catch (ingestError) {
      setIngestStatus(
        ingestError instanceof Error ? ingestError.message : "Unable to ingest the knowledge document"
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Private knowledge</p>
            <h1 className="mt-2 text-3xl font-semibold">SignalOps assistant</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              Dashboard
            </Link>
            <Link
              href="/"
              className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Home
            </Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.8fr_0.9fr]">
          <aside className="rounded-[28px] border border-white/10 bg-slate-900/80 p-4">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Sessions</p>
                <h2 className="mt-2 text-xl font-semibold">Chats</h2>
              </div>
              <button
                type="button"
                onClick={() => void createSession(`Private knowledge chat ${sessions.length + 1}`)}
                className="rounded-full bg-cyan-400 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-cyan-300"
              >
                New
              </button>
            </div>

            <div className="space-y-2">
              {sessions.length === 0 ? (
                <p className="text-sm text-slate-400">No sessions yet.</p>
              ) : null}

              {sessions.map((session) => {
                const active = currentSessionId === session.id;
                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => void selectSession(session.id)}
                    className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                      active
                        ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-50"
                        : "border-white/10 bg-slate-950/40 text-slate-200 hover:bg-slate-800/80"
                    }`}
                  >
                    <p className="text-sm font-medium">{session.title}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      {session.id.slice(0, 8)}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="rounded-[28px] border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-cyan-950/20">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Conversation</p>
                <h2 className="mt-2 text-xl font-semibold">Private RAG chat</h2>
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-300">
                {currentSessionId ? "Session live" : "Starting"}
              </span>
            </div>

            <div className="flex h-[480px] flex-col gap-4 overflow-y-auto rounded-2xl bg-slate-950/60 p-4">
              {!currentSessionId && !error ? (
                <p className="text-sm text-slate-400">Creating chat session...</p>
              ) : null}

              {messages.length === 0 && !loading && currentSessionId ? (
                <p className="text-sm text-slate-400">
                  No messages yet. Ask about project context, escalation policies, or operating guidance.
                </p>
              ) : null}

              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}-${message.content.slice(0, 20)}`}
                  className={`max-w-[85%] rounded-2xl p-3 text-sm leading-6 ${
                    message.role === "assistant"
                      ? "bg-cyan-500/10 text-cyan-50 ring-1 ring-cyan-400/20"
                      : "ml-auto bg-violet-500/10 text-violet-50 ring-1 ring-violet-400/20"
                  }`}
                >
                  <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-slate-300">
                    {message.role === "assistant" ? "Assistant" : "You"}
                  </p>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.references ? (
                    <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                      Sources: {message.references}
                    </p>
                  ) : null}
                </div>
              ))}

              {loading ? (
                <div className="max-w-[70%] rounded-2xl bg-slate-800 p-3 text-sm text-slate-300 ring-1 ring-white/10">
                  Thinking through the private knowledge base...
                </div>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 p-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                placeholder="Ask a question about your internal knowledge base..."
              />

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">
                  {currentSessionId ? "Backend session connected" : "Waiting for backend session"}
                </p>
                <button
                  type="submit"
                  disabled={loading || !currentSessionId}
                  className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send message"}
                </button>
              </div>

              {error ? (
                <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </p>
              ) : null}
            </form>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-cyan-400/20 bg-cyan-500/5 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Knowledge ingestion</p>
              <form onSubmit={handleIngestKnowledge} className="mt-4 space-y-3">
                <input
                  value={knowledgeTitle}
                  onChange={(event) => setKnowledgeTitle(event.target.value)}
                  className="w-full rounded-xl border border-cyan-400/20 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                  placeholder="Document title"
                />
                <select
                  value={knowledgeType}
                  onChange={(event) => setKnowledgeType(event.target.value)}
                  className="w-full rounded-xl border border-cyan-400/20 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                >
                  <option value="manual">Manual</option>
                  <option value="wiki">Wiki</option>
                  <option value="runbook">Runbook</option>
                  <option value="policy">Policy</option>
                </select>
                <textarea
                  value={knowledgeContent}
                  onChange={(event) => setKnowledgeContent(event.target.value)}
                  rows={8}
                  className="w-full rounded-xl border border-cyan-400/20 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                  placeholder="Paste internal operating guidance or runbook text here..."
                />
                <button
                  type="submit"
                  className="w-full rounded-full bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Ingest to knowledge base
                </button>
              </form>

              {ingestStatus ? (
                <p className="mt-3 text-xs text-cyan-100">{ingestStatus}</p>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">System</p>
              <h3 className="mt-3 text-xl font-semibold">Private knowledge flow</h3>
              <ol className="mt-5 space-y-4 text-sm text-slate-300">
                <li>1. Create or reuse a chat session.</li>
                <li>2. Ingest internal docs and runbooks.</li>
                <li>3. Search relevant chunks for grounded answers.</li>
                <li>4. Persist chat history in PostgreSQL.</li>
              </ol>
            </div>

            <div className="rounded-[28px] border border-cyan-400/20 bg-cyan-500/5 p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Example prompts</p>
              <div className="mt-4 space-y-3 text-sm text-cyan-50">
                <button
                  type="button"
                  onClick={() => setInput("Summarize the project onboarding process for a new engineer.")}
                  className="block w-full rounded-xl border border-cyan-400/20 bg-slate-950/40 px-3 py-2 text-left transition hover:bg-slate-950/60"
                >
                  Summarize the project onboarding process.
                </button>
                <button
                  type="button"
                  onClick={() => setInput("What is the escalation path when production incidents occur?")}
                  className="block w-full rounded-xl border border-cyan-400/20 bg-slate-950/40 px-3 py-2 text-left transition hover:bg-slate-950/60"
                >
                  What is the escalation path for production incidents?
                </button>
                <button
                  type="button"
                  onClick={() => setInput("Give me the rollout checklist for a major release.")}
                  className="block w-full rounded-xl border border-cyan-400/20 bg-slate-950/40 px-3 py-2 text-left transition hover:bg-slate-950/60"
                >
                  Give me the rollout checklist for a major release.
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
