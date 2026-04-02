/**
 * Lists curriculum days missing from scenarioDrill.json or with zero scenarios.
 * Usage: node scripts/check-scenario-drill.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const curriculumPath = path.join(root, 'public', 'data', 'curriculum.json');
const drillPath = path.join(root, 'public', 'data', 'scenarioDrill.json');

const curriculum = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));
const drill = JSON.parse(fs.readFileSync(drillPath, 'utf8'));

const totalDays = curriculum.totalDays ?? 90;
const allDays = new Set(Array.from({ length: totalDays }, (_, i) => i + 1));

const byDay = new Map();
for (const b of drill.days ?? []) {
  byDay.set(b.day, b);
}

const missing = [];
const empty = [];

for (let d = 1; d <= totalDays; d++) {
  const b = byDay.get(d);
  if (!b) {
    missing.push(d);
    continue;
  }
  const n = Array.isArray(b.scenarios) ? b.scenarios.length : 0;
  if (n === 0) empty.push(d);
}

console.log(`Scenario drill v${drill.version ?? '?'}`);
console.log(`Curriculum days: 1–${totalDays}`);
console.log(`Bundles in JSON: ${byDay.size}`);
console.log('');

if (missing.length) {
  console.log(`Missing bundle (no entry for day): ${missing.length} days`);
  console.log(missing.join(', '));
  console.log('');
} else {
  console.log('Every day has a bundle entry.');
  console.log('');
}

if (empty.length) {
  console.log(`Empty scenarios array: ${empty.length} days`);
  console.log(empty.join(', '));
  console.log('');
} else {
  console.log('No empty scenario lists.');
  console.log('');
}

const withContent = [...byDay.entries()].filter(([, b]) => (b.scenarios?.length ?? 0) > 0).length;
console.log(`Days with ≥1 scenario: ${withContent}`);

// Set STRICT_SCENARIO_DRILL=1 to fail CI when coverage is incomplete
if (process.env.STRICT_SCENARIO_DRILL === '1' && (missing.length || empty.length)) {
  process.exitCode = 1;
}
