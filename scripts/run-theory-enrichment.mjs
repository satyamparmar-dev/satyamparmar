/**
 * Appends markdown to each day's theory section (idempotent).
 * Content: scripts/enrichment/phaseN.mjs → export default { day: "markdown", ... }
 * Usage: node scripts/run-theory-enrichment.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, '..', 'public', 'data');
const MARKER = '\n\n### Satyverse — deeper path (theory → practice)\n';

async function loadPhaseModule(phaseFile) {
  const name = phaseFile.replace('.json', '');
  const modPath = path.join(__dirname, 'enrichment', `${name}.mjs`);
  if (!fs.existsSync(modPath)) return null;
  const mod = await import(pathToFileURL(modPath).href);
  return mod.default ?? {};
}

async function enrichPhase(phaseFile) {
  const byDay = await loadPhaseModule(phaseFile);
  if (!byDay || Object.keys(byDay).length === 0) return 0;
  const p = path.join(DATA, phaseFile);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  let n = 0;
  for (const dayObj of data.days) {
    const add = byDay[dayObj.day];
    if (!add) continue;
    const theory = dayObj.sections?.find((s) => s.type === 'theory');
    if (!theory) continue;
    if (theory.content.includes('### Satyverse — deeper path')) continue;
    theory.content += MARKER + String(add).trim();
    n++;
  }
  if (n > 0) {
    fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
  }
  return n;
}

const phases = Array.from({ length: 10 }, (_, i) => `phase${i + 1}.json`);

async function main() {
  let total = 0;
  for (const f of phases) {
    const fp = path.join(DATA, f);
    if (!fs.existsSync(fp)) continue;
    const n = await enrichPhase(f);
    if (n) console.log(`${f}: +${n}`);
    total += n;
  }
  console.log(`Total days enriched: ${total}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
