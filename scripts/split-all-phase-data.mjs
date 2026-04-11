/**
 * One-off / repeatable: split phase lesson days and scenario drill into public/data/days/*.json
 * and set externalDayNumbers on phase*.json and scenarioDrill.json.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'public', 'data');
const daysDir = path.join(root, 'days');

fs.mkdirSync(daysDir, { recursive: true });

function discoverLessonDays(phaseBase) {
  const files = fs.existsSync(daysDir) ? fs.readdirSync(daysDir) : [];
  const prefix = `${phaseBase}-day`;
  const nums = [];
  for (const f of files) {
    if (!f.startsWith(prefix) || !f.endsWith('.json')) continue;
    const n = parseInt(f.slice(prefix.length, -'.json'.length), 10);
    if (Number.isFinite(n)) nums.push(n);
  }
  return [...new Set(nums)].sort((a, b) => a - b);
}

// ─── Phases 1–10 ───────────────────────────────────────────
for (let p = 1; p <= 10; p++) {
  const fname = `phase${p}.json`;
  const fpath = path.join(root, fname);
  if (!fs.existsSync(fpath)) continue;

  const phase = JSON.parse(fs.readFileSync(fpath, 'utf8'));
  const base = fname.replace(/\.json$/i, '');

  if (Array.isArray(phase.days) && phase.days.length > 0) {
    const nums = [];
    for (const d of phase.days) {
      nums.push(d.day);
      const out = path.join(daysDir, `${base}-day${d.day}.json`);
      fs.writeFileSync(out, JSON.stringify(d, null, 2) + '\n');
    }
    phase.externalDayNumbers = [...new Set(nums)].sort((a, b) => a - b);
    phase.days = [];
    console.log(fname, '→', phase.externalDayNumbers.length, 'lesson files');
  } else if (!phase.externalDayNumbers?.length) {
    phase.externalDayNumbers = discoverLessonDays(base);
    if (phase.externalDayNumbers.length) {
      console.log(fname, '→ manifest only:', phase.externalDayNumbers.length, 'days (already split)');
    }
  }

  fs.writeFileSync(fpath, JSON.stringify(phase, null, 2) + '\n');
}

// ─── Scenario drill ─────────────────────────────────────────
const drillPath = path.join(root, 'scenarioDrill.json');
const drill = JSON.parse(fs.readFileSync(drillPath, 'utf8'));
const allScenarioDays = new Set();

for (const f of fs.readdirSync(daysDir)) {
  const m = f.match(/^scenarioDrill-day(\d+)\.json$/);
  if (m) allScenarioDays.add(parseInt(m[1], 10));
}

if (Array.isArray(drill.days) && drill.days.length > 0) {
  for (const b of drill.days) {
    allScenarioDays.add(b.day);
    fs.writeFileSync(
      path.join(daysDir, `scenarioDrill-day${b.day}.json`),
      JSON.stringify(b, null, 2) + '\n'
    );
  }
}

drill.externalDayNumbers = [...allScenarioDays].sort((a, b) => a - b);
drill.days = [];
fs.writeFileSync(drillPath, JSON.stringify(drill, null, 2) + '\n');
console.log('scenarioDrill.json →', drill.externalDayNumbers.length, 'scenario day files');
