import { NextResponse } from "next/server";
import { buildPrivateChatPrompt, rankRelevantContext } from "@/lib/rag-chat";

export async function POST(request: Request) {
  const body = (await request.json()) as { query?: string; context?: string[]; source?: string[] };
  const query = body.query ?? "";
  const chunks = body.context ?? [];
  const sources = body.source ?? [];

  const rankedContext = rankRelevantContext(query, chunks, sources);
  const answer = buildPrivateChatPrompt(query, rankedContext);

  return NextResponse.json({
    answer,
    sources: rankedContext.map((entry) => ({ source: entry.source, score: entry.score })),
  });
}
