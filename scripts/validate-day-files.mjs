#!/usr/bin/env node
/**
 * Validates all public/data/days/*.json files against the expected schema.
 * Run: node scripts/validate-day-files.mjs
 * Add to CI: npm run validate:days
 */
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DAYS_DIR = join(__dirname, '../public/data/days');

const REQUIRED_TOP_LEVEL = ['day', 'title', 'sections'];
const REQUIRED_SECTION_TYPES = [
  'why',
  'theory',
  'code',
  'diagram',
  'pitfalls',
  'exercise',
  'interview',
  'cheatsheet',
];

let errors = 0;
let checked = 0;

const files = readdirSync(DAYS_DIR).filter(
  (f) => f.endsWith('.json') && f.startsWith('phase')
);

for (const file of files) {
  const filepath = join(DAYS_DIR, file);
  let data;
  try {
    data = JSON.parse(readFileSync(filepath, 'utf8'));
  } catch (e) {
    console.error(`❌ ${file}: Invalid JSON — ${e.message}`);
    errors++;
    continue;
  }

  for (const key of REQUIRED_TOP_LEVEL) {
    if (data[key] === undefined) {
      console.error(`❌ ${file}: Missing top-level field "${key}"`);
      errors++;
    }
  }

  if (!Array.isArray(data.sections)) continue;

  const sectionTypes = data.sections.map((s) => s.type);
  for (const type of REQUIRED_SECTION_TYPES) {
    if (type === 'code') continue;
    if (!sectionTypes.includes(type)) {
      console.warn(`⚠️  ${file}: Missing section type "${type}"`);
    }
  }

  const codeSections = data.sections.filter((s) => s.type === 'code');
  if (codeSections.length !== 3) {
    console.warn(
      `⚠️  ${file}: Expected 3 code sections, found ${codeSections.length}`
    );
  }
  for (const cs of codeSections) {
    if (!cs.output || cs.output.trim() === '') {
      console.error(
        `❌ ${file}: Code section "${cs.level}" has empty output field`
      );
      errors++;
    }
    if (!cs.code || cs.code.trim() === '') {
      console.error(
        `❌ ${file}: Code section "${cs.level}" has empty code field`
      );
      errors++;
    }
  }

  const interview = data.sections.find((s) => s.type === 'interview');
  if (interview) {
    if (!interview.conceptual || interview.conceptual.length < 10) {
      console.warn(
        `⚠️  ${file}: interview.conceptual has fewer than 10 items (${interview.conceptual?.length ?? 0})`
      );
    }
    if (!interview.codeBased || interview.codeBased.length < 5) {
      console.warn(
        `⚠️  ${file}: interview.codeBased has fewer than 5 items (${interview.codeBased?.length ?? 0})`
      );
    }
  }

  checked++;
}

console.log(`\nValidated ${checked} day files. Errors: ${errors}`);
if (errors > 0) process.exit(1);
