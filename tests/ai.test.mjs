import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const aiSource = readFileSync(new URL("../src/lib/ai.ts", import.meta.url), "utf8");
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
