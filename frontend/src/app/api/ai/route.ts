import { NextRequest, NextResponse } from "next/server";

import { generateAiInsight } from "@/lib/ai";
import { fetchInsightFromAiAgent } from "@/lib/ai-agent";
import { FALLBACK_AI_INSIGHT, FALLBACK_PROMPT } from "@/lib/insight-content";

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }

    const prompt =
      typeof body?.prompt === "string" ? body.prompt.trim() || FALLBACK_PROMPT : FALLBACK_PROMPT;
    const productIdea = typeof body?.productIdea === "string" ? body.productIdea.trim() : "";
    const team = typeof body?.team === "string" ? body.team : "Platform & AI Ops";
    const preferredSource = body?.source === "local" ? "local" : "ai";

    if (preferredSource === "local") {
      return NextResponse.json({
        ...generateAiInsight(prompt, team, productIdea),
        source: "local-heuristic",
      });
    }

    const aiAgentInsight = await fetchInsightFromAiAgent(prompt, team, productIdea);
    if (aiAgentInsight) {
      return NextResponse.json({ ...aiAgentInsight, source: "ai-agent" });
    }

    const fallbackInsight = generateAiInsight(prompt, team, productIdea);
    return NextResponse.json({ ...fallbackInsight, source: "local-heuristic" });
  } catch {
    return NextResponse.json(
      { ...FALLBACK_AI_INSIGHT, source: "local-heuristic" },
      { status: 500 }
    );
  }
}
