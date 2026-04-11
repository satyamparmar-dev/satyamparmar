/**
 * Generate enriched day JSON + scenario drills for phases 8–10 (days 68–90).
 */
import { METAS_8 } from './metas-phase8.mjs';
import { METAS_9 } from './metas-phase9.mjs';
import { METAS_10 } from './metas-phase10.mjs';
import { writeDay } from './factory.mjs';

const all = [...METAS_8, ...METAS_9, ...METAS_10];
for (const m of all) {
  writeDay(m);
}
console.log(`Wrote ${all.length} phase day files + scenario drills (68–90).`);
