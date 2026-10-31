import { NextRequest, NextResponse } from "next/server";

import { generateAiInsight } from "@/lib/ai";
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
      typeof body?.prompt === "string"
        ? body.prompt.trim() || FALLBACK_PROMPT
        : FALLBACK_PROMPT;
    const productIdea = typeof body?.productIdea === "string" ? body.productIdea.trim() : "";
    const team = typeof body?.team === "string" ? body.team : "Platform & AI Ops";

    const insight = generateAiInsight(prompt, team, productIdea);
    return NextResponse.json(insight);
  } catch (error) {
    return NextResponse.json(FALLBACK_AI_INSIGHT, { status: 500 });
  }
}
