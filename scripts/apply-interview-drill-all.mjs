/**
 * Applies merged Interview Drill (Days 1–90) to public/data/phase1.json … phase10.json
 * Counts: 15 conceptual, 10 code-based, 6 senior, 6 wrong answers (topic-specific)
 */
import fs from 'node:fs';
import { INTERVIEW_BANK } from './interviewBankDays1to18.mjs';
import { INTERVIEW_BANK_19_90 } from './interviewBankDays19to90.mjs';
import { applyInterviewBank } from './interviewBankDays1to18.mjs';

const MERGED = { ...INTERVIEW_BANK, ...INTERVIEW_BANK_19_90 };

for (let p = 1; p <= 10; p++) {
  const file = `public/data/phase${p}.json`;
  const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const data = JSON.parse(raw);
  applyInterviewBank(data, MERGED);
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`Updated Interview Drill: ${file}`);
}

console.log('Done: Days 1–90 Interview Drill (15/10/6/6) applied to all phase JSON files.');
