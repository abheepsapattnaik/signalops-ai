import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const aiSource = readFileSync(new URL("../src/lib/ai.ts", import.meta.url), "utf8");
const ragSource = readFileSync(new URL("../src/lib/rag-chat.ts", import.meta.url), "utf8");
const insightContentSource = readFileSync(
  new URL("../src/lib/insight-content.ts", import.meta.url),
  "utf8"
);

test("insight configuration is centralized in a dedicated content file", () => {
  assert.match(insightContentSource, /export const DEFAULT_PROMPT/);
  assert.match(insightContentSource, /export const DEFAULT_IDEA/);
  assert.match(insightContentSource, /export const TEAM_CONTEXT/);
  assert.match(insightContentSource, /export const FALLBACK_AI_INSIGHT/);
  assert.match(aiSource, /from ".\/insight-content"/);
});

test("AI insight generator includes leadership-focused guidance", () => {
  assert.match(aiSource, /generateAiInsight/);
  assert.match(aiSource, /leaderMessage/);
  assert.match(insightContentSource, /AI-assisted backlog prioritization/);
});

test("AI insight generator includes risk and recommendation planning", () => {
  assert.match(aiSource, /risks/);
  assert.match(aiSource, /recommendations/);
  assert.match(insightContentSource, /Release confidence scoring/);
});

test("AI insight generator includes architecture decisioning for system design, HLD, and LLD", () => {
  assert.match(aiSource, /systemDesign/);
  assert.match(aiSource, /highLevelDesign/);
  assert.match(aiSource, /lowLevelDesign/);
  assert.match(aiSource, /architecture:\s*\{/);
});

test("AI agent prompt explicitly requests system design, HLD, and LLD data from the model", () => {
  const aiAgentSource = readFileSync(new URL("../src/lib/ai-agent.ts", import.meta.url), "utf8");

  assert.match(aiAgentSource, /system design, HLD, and LLD/i);
  assert.match(aiAgentSource, /architecture must include systemDesign/i);
  assert.match(aiAgentSource, /highLevelDesign and lowLevelDesign as arrays/i);
});

test("AI responses include leadership signals alongside architecture guidance", () => {
  const aiAgentSource = readFileSync(new URL("../src/lib/ai-agent.ts", import.meta.url), "utf8");

  assert.match(aiSource, /leadershipSignals/);
  assert.match(aiSource, /deliveryHealth/);
  assert.match(aiSource, /aiConfidence/);
  assert.match(aiSource, /riskTrend/);
  assert.match(aiAgentSource, /Watchlist:/i);
  assert.match(aiAgentSource, /Never return 'Amber'/i);
});

test("API route respects explicit source selection and falls back only when AI is selected and fails", () => {
  const routeSource = readFileSync(new URL("../src/app/api/ai/route.ts", import.meta.url), "utf8");

  assert.match(routeSource, /preferredSource/);
  assert.match(routeSource, /source === "local"/);
  assert.match(routeSource, /fetchInsightFromAiAgent/);
  assert.match(routeSource, /fallbackInsight/);
});

test("private RAG helper ranks context and builds a grounded prompt", () => {
  assert.match(ragSource, /scoreContextMatch/);
  assert.match(ragSource, /rankRelevantContext/);
  assert.match(ragSource, /buildPrivateChatPrompt/);
  assert.match(ragSource, /private knowledge/i);
});

test("private chat API route exposes a backend-friendly response payload", () => {
  const chatRouteSource = readFileSync(new URL("../src/app/api/chat/route.ts", import.meta.url), "utf8");

  assert.match(chatRouteSource, /buildPrivateChatPrompt/);
  assert.match(chatRouteSource, /rankRelevantContext/);
  assert.match(chatRouteSource, /NextResponse\.json/);
});
