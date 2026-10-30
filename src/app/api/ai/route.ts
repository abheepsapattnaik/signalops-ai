import { NextRequest, NextResponse } from "next/server";

import { generateAiInsight } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() || "We need a clearer AI-driven operating model for delivery and reliability." : "We need a clearer AI-driven operating model for delivery and reliability.";
    const team = typeof body?.team === "string" ? body.team : "Platform & AI Ops";

    const insight = generateAiInsight(prompt, team);
    return NextResponse.json(insight);
  } catch (error) {
    return NextResponse.json(
      {
        summary: "The AI guidance service encountered a temporary issue. Retry with a simpler prompt to continue the scenario.",
        health: "Needs attention",
        leaderMessage:
          "Even resilient systems occasionally fail, which is why the leadership model must include fallback processes and clear escalation paths.",
        roadmap: [],
        risks: ["The analysis service could not complete the requested turnaround."],
        recommendations: ["Retry the request with a shorter prompt and confirm the operating context."],
      },
      { status: 500 }
    );
  }
}
