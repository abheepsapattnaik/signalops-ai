import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/lib/ai.ts', import.meta.url), 'utf8');

test('AI insight generator includes leadership-focused guidance', () => {
  assert.match(source, /generateAiInsight/);
  assert.match(source, /leaderMessage/);
  assert.match(source, /AI-assisted backlog prioritization/);
});

test('AI insight generator includes risk and recommendation planning', () => {
  assert.match(source, /risks/);
  assert.match(source, /recommendations/);
  assert.match(source, /delivery confidence/);
});

test('AI insight generator includes architecture decisioning for system design, HLD, and LLD', () => {
  assert.match(source, /systemDesign/);
  assert.match(source, /highLevelDesign/);
  assert.match(source, /lowLevelDesign/);
  assert.match(source, /architecture:\s*\{/);
});
