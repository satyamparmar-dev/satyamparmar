#!/usr/bin/env node
/**
 * Generates enriched `phase7-day{N}.json` + `scenarioDrill-day{N}.json` for N=59..67.
 * Run: node scripts/gen-phase7/build.mjs
 */
import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { assemblePhaseDay, writeJsonSync } from '../gen-phase6/lib.mjs';
import cfg59, { drill59 } from './day59.mjs';
import cfg60, { drill60 } from './day60.mjs';
import cfg61, { drill61 } from './day61.mjs';
import cfg62, { drill62 } from './day62.mjs';
import cfg63, { drill63 } from './day63.mjs';
import cfg64, { drill64 } from './day64.mjs';
import cfg65, { drill65 } from './day65.mjs';
import cfg66, { drill66 } from './day66.mjs';
import cfg67, { drill67 } from './day67.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const daysDir = path.join(__dirname, '../../public/data/days');

const BUNDLE = [
  [cfg59, drill59],
  [cfg60, drill60],
  [cfg61, drill61],
  [cfg62, drill62],
  [cfg63, drill63],
  [cfg64, drill64],
  [cfg65, drill65],
  [cfg66, drill66],
  [cfg67, drill67],
];

for (const [cfg, drill] of BUNDLE) {
  const p = path.join(daysDir, `phase7-day${cfg.day}.json`);
  writeJsonSync(fs, p, assemblePhaseDay(cfg));
  const dp = path.join(daysDir, `scenarioDrill-day${cfg.day}.json`);
  writeJsonSync(fs, dp, drill);
  console.log('Wrote', path.basename(p), path.basename(dp));
}
