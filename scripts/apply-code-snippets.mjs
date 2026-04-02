/**
 * Overwrites Code tab sections (description, code, output) from the topic-specific bank
 * for days 1–90 across all phase JSON files.
 */
import fs from 'node:fs';
import { SNIPPETS } from './codeSnippetBank.mjs';

for (let phase = 1; phase <= 10; phase++) {
  const path = `public/data/phase${phase}.json`;
  const raw = fs.readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
  const data = JSON.parse(raw);

  for (const day of data.days) {
    const bank = SNIPPETS[day.day];
    if (!bank) continue;

    for (const section of day.sections) {
      if (section.type !== 'code') continue;
      const level = section.level;
      const entry = bank[level];
      if (!entry) continue;

      section.description = entry.description;
      section.code = entry.code;
      if (entry.output !== undefined) section.output = entry.output;
    }
  }

  fs.writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`Updated ${path}`);
}

console.log('Done: Code tab snippets + descriptions applied for days 1–90.');
