/**
 * Align markdown pipe tables in Day 90 JSON by padding cells with spaces only.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, '..', 'public', 'data', 'days', 'phase10-day90.json');

function parseTableRow(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|')) return null;
  const inner = trimmed.slice(1, trimmed.endsWith('|') ? -1 : undefined);
  const parts = inner.split('|');
  return parts.map((p) => p.trim());
}

function isSeparatorRow(cells) {
  if (!cells || cells.length === 0) return false;
  return cells.every((c) => /^:?-{3,}:?$/.test(c.replace(/\s/g, '')));
}

function alignTableBlock(lines) {
  const rows = [];
  for (const line of lines) {
    const cells = parseTableRow(line);
    if (!cells) return null;
    rows.push(cells);
  }
  if (rows.length < 2) return null;

  const numCols = Math.max(...rows.map((r) => r.length));
  const widths = Array(numCols).fill(0);

  for (const row of rows) {
    if (isSeparatorRow(row)) continue;
    row.forEach((c, i) => {
      widths[i] = Math.max(widths[i] || 0, (c || '').length);
    });
  }

  const out = [];
  for (const row of rows) {
    if (isSeparatorRow(row)) {
      const sep = '|' + widths.map((w) => ' ' + '-'.repeat(Math.max(3, w)) + ' ').join('|') + '|';
      out.push(sep);
    } else {
      const padded = [];
      for (let i = 0; i < numCols; i++) {
        const cell = (row[i] !== undefined ? row[i] : '').padEnd(widths[i]);
        padded.push(cell);
      }
      out.push('| ' + padded.join(' | ') + ' |');
    }
  }
  return out;
}

function alignMarkdownTablesInText(text) {
  const lines = text.split('\n');
  const out = [];
  let i = 0;
  let inFence = false;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      inFence = !inFence;
      out.push(line);
      i++;
      continue;
    }
    if (inFence) {
      out.push(line);
      i++;
      continue;
    }
    const cells = parseTableRow(line);
    if (cells) {
      const block = [];
      let j = i;
      while (j < lines.length) {
        const L = lines[j];
        if (L.trim().startsWith('```')) break;
        const c = parseTableRow(L);
        if (!c) break;
        block.push(L);
        j++;
      }
      const aligned = alignTableBlock(block);
      if (aligned) {
        out.push(...aligned);
        i = j;
        continue;
      }
    }
    out.push(line);
    i++;
  }
  return out.join('\n');
}

const data = JSON.parse(readFileSync(filePath, 'utf8'));

for (const section of data.sections || []) {
  if (section.content && typeof section.content === 'string') {
    section.content = alignMarkdownTablesInText(section.content);
  }
  if (section.type === 'interview') {
    for (const key of ['conceptual', 'codeBased', 'seniorScenario']) {
      const arr = section[key];
      if (!Array.isArray(arr)) continue;
      for (const item of arr) {
        if (item.answer && typeof item.answer === 'string') {
          item.answer = alignMarkdownTablesInText(item.answer);
        }
        if (item.question && typeof item.question === 'string') {
          item.question = alignMarkdownTablesInText(item.question);
        }
        if (Array.isArray(item.followUps)) {
          for (const fu of item.followUps) {
            if (fu.answer && typeof fu.answer === 'string') {
              fu.answer = alignMarkdownTablesInText(fu.answer);
            }
            if (fu.question && typeof fu.question === 'string') {
              fu.question = alignMarkdownTablesInText(fu.question);
            }
          }
        }
      }
    }
  }
}

const outText = JSON.stringify(data, null, 2);
JSON.parse(outText);
writeFileSync(filePath, outText, 'utf8');
console.log('Formatted:', filePath);
