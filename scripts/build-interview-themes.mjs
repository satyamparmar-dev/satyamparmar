/**
 * Writes public/data/scenarioInterviewThemes.json from scripts/scenario-interview-themes-data.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { themes } from './scenario-interview-themes-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, '..', 'public', 'data', 'scenarioInterviewThemes.json');

const payload = { version: 1, themes };

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(payload, null, 2), 'utf8');

console.log(`Wrote ${themes.length} theme packs (${themes.reduce((n, t) => n + t.scenarios.length, 0)} scenarios) → ${out}`);
