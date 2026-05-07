/**
 * Restores the original theory/explanation content from git history,
 * then appends the new code/commands/steps sections after it.
 *
 * Run: node scripts/restore-and-merge-answers.mjs
 */
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

const FILE = 'public/data/scenarioInterviewThemes.json';
const ORIGINAL_COMMIT = '7ade775'; // commit before rewrites

// ── Load original JSON from git history ──────────────────────
const originalRaw = execSync(`git show ${ORIGINAL_COMMIT}:${FILE}`, { maxBuffer: 10 * 1024 * 1024 }).toString('utf8');
const originalData = JSON.parse(originalRaw);

// Build a lookup: scenarioId → original answer
const originalAnswers = {};
for (const theme of originalData.themes) {
  for (const s of theme.scenarios) {
    originalAnswers[s.id] = s.answer;
  }
}

// ── Load current (rewritten) JSON ─────────────────────────────
const currentData = JSON.parse(readFileSync(FILE, 'utf8'));

// ── IDs that were rewritten (need merging) ────────────────────
const rewrittenIds = new Set([
  // backend-production-chaos
  'th-prod-oom', 'th-prod-latency', 'th-prod-legacy-tests',
  'th-prod-kafka-lag', 'th-prod-500-no-logs', 'th-prod-k8s', 'th-prod-batch',
  // microservices-scenarios
  'th-ms-slow-one', 'th-ms-cascade', 'th-ms-contract', 'th-ms-saga',
  'th-ms-no-traffic', 'th-ms-config', 'th-ms-scale-one', 'th-ms-logs-five',
]);

const DIVIDER = [
  '',
  '---',
  '',
  '# 🔧 How to actually do it — commands, code & steps',
  '',
].join('\n');

let merged = 0;
for (const theme of currentData.themes) {
  for (const scenario of theme.scenarios) {
    if (!rewrittenIds.has(scenario.id)) continue;

    const original = originalAnswers[scenario.id];
    const rewritten = scenario.answer;

    if (!original) {
      console.warn(`⚠️  No original found for ${scenario.id} — skipping`);
      continue;
    }

    // Combine: full original theory + divider + new code/command sections
    scenario.answer = original.trimEnd() + DIVIDER + rewritten.trimStart();
    merged++;
    console.log(`✅ Merged: ${scenario.id}`);
  }
}

writeFileSync(FILE, JSON.stringify(currentData, null, 2));
console.log(`\nDone — ${merged} scenarios now have original theory + new code sections.`);
