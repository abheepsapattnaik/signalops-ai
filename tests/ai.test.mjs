import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const source = readFileSync(new URL('../src/lib/ai.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});

const module = { exports: {} };
const sandbox = {
  module,
  exports: module.exports,
  require: createRequire(import.meta.url),
  console,
  setTimeout,
  clearTimeout,
};

vm.runInNewContext(compiled.outputText, sandbox, { filename: 'ai.js' });

const { generateAiInsight, generateArchitectureFromIdea } = module.exports;

test('generateArchitectureFromIdea creates a marketplace-specific architecture', () => {
  const idea =
    'A marketplace platform where local service providers list offerings, customers book services, and payments are processed securely with order tracking.';

  const result = generateArchitectureFromIdea(idea);

  assert.match(result.systemDesign, /marketplace|catalog|orders|payments/i);
  assert.ok(result.highLevelDesign.some((item) => /catalog|orders|payments|fulfillment/i.test(item)));
  assert.ok(result.lowLevelDesign.some((item) => /idempotent|duplicate|fraud|audit/i.test(item)));
});

test('generateAiInsight includes leadership-ready guidance and roadmap planning', () => {
  const result = generateAiInsight(
    'We need better release confidence and incident response across the platform organization.',
    'Platform & AI Ops',
    'A platform that helps engineering teams triage incidents and improve delivery risk.'
  );

  assert.match(result.summary, /delivery|operational|decision|prioritization|reliability/i);
  assert.match(result.leaderMessage, /decision quality|prioritization|execution/i);
  assert.equal(result.roadmap.length >= 3, true);
  assert.ok(result.recommendations.some((item) => /release|prioritization|dashboard/i.test(item)));
});

test('generateAiInsight adapts architecture output for AI-first product ideas', () => {
  const result = generateAiInsight(
    'AI assistant and roadmap planning',
    'Platform & AI Ops',
    'An AI copilot for engineering teams to summarize incidents, draft status updates, and suggest the next action.'
  );

  assert.match(result.architecture.systemDesign, /AI|model|orchestration|retrieval/i);
  assert.ok(result.architecture.highLevelDesign.some((item) => /AI layer|model|recommendation/i.test(item)));
  assert.ok(result.architecture.lowLevelDesign.some((item) => /prompt|rate limits|guardrails|cost tracking/i.test(item)));
});

test('AI insight generator includes architecture decisioning for system design, HLD, and LLD', () => {
  const result = generateAiInsight(
    'delivery and reliability leadership',
    'Platform & AI Ops',
    'A system for tracking customer health and managing operational analytics.'
  );

  assert.ok(result.architecture.systemDesign.length > 0);
  assert.ok(Array.isArray(result.architecture.highLevelDesign));
  assert.ok(Array.isArray(result.architecture.lowLevelDesign));
  assert.equal(result.architecture.highLevelDesign.length > 0, true);
  assert.equal(result.architecture.lowLevelDesign.length > 0, true);
});
