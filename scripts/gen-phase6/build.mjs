#!/usr/bin/env node
/**
 * Generates enriched `phase6-day{N}.json` + `scenarioDrill-day{N}.json` for N=53..58.
 * Run: node scripts/gen-phase6/build.mjs
 */
import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { assemblePhaseDay, writeJsonSync, scenarioDrillItem } from './lib.mjs';
import cfg53, { drill53 } from './day53.mjs';
import cfg54, { drill54 } from './day54.mjs';
import cfg55, { drill55 } from './day55.mjs';
import cfg56, { drill56 } from './day56.mjs';
import cfg57, { drill57 } from './day57.mjs';
import cfg58, { drill58 } from './day58.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const daysDir = path.join(__dirname, '../../public/data/days');

const BUNDLE = [
  [cfg53, drill53],
  [cfg54, drill54],
  [cfg55, drill55],
  [cfg56, drill56],
  [cfg57, drill57],
  [cfg58, drill58],
];

for (const [cfg, drill] of BUNDLE) {
  const p = path.join(daysDir, `phase6-day${cfg.day}.json`);
  writeJsonSync(fs, p, assemblePhaseDay(cfg));
  const dp = path.join(daysDir, `scenarioDrill-day${cfg.day}.json`);
  writeJsonSync(fs, dp, drill);
  console.log('Wrote', path.basename(p), path.basename(dp));
}
