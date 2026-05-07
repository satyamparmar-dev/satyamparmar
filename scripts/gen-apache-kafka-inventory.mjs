/**
 * Writes public/data/apache-kafka/inventory.json (Phase 1 artifact) from files on disk.
 * Run: node scripts/gen-apache-kafka-inventory.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'public', 'data', 'apache-kafka');

function walkFiles(dir, base = '') {
  const out = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (name.name.startsWith('.')) continue;
    const rel = base ? `${base}/${name.name}` : name.name;
    const full = path.join(dir, name.name);
    if (name.isDirectory()) out.push(...walkFiles(full, rel));
    else out.push(rel.replace(/\\/g, '/'));
  }
  return out;
}

function contentType(ext) {
  if (ext === '.md') return 'documentation';
  if (ext === '.yml' || ext === '.yaml') return 'configuration';
  if (ext === '.java') return 'source code';
  if (ext === '.xml') return 'build file';
  if (ext === '.puml') return 'diagram';
  return 'other';
}

const IGNORE = new Set(['inventory.json', 'AUDIT.txt']);
const paths = walkFiles(root)
  .filter((p) => !IGNORE.has(p))
  .sort();

const inventory = paths.map((p) => {
  const ext = path.extname(p);
  return {
    fullPath: p,
    fileType: ext.slice(1) || 'none',
    language: ext === '.java' ? 'Java' : ext === '.md' ? 'Markdown' : ext === '.yml' ? 'YAML' : ext === '.xml' ? 'XML' : ext === '.puml' ? 'PlantUML' : 'text',
    topic: p.split('/')[0] ?? p,
    contentKind: contentType(ext),
    summary: `Upstream file from Apache-Kafka repository at path ${p}.`,
  };
});

fs.writeFileSync(path.join(root, 'inventory.json'), JSON.stringify({ generated: true, fileCount: inventory.length, files: inventory }, null, 2), 'utf8');
console.log(`Wrote inventory.json with ${inventory.length} entries.`);
