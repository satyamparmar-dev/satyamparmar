/**
 * Phase 5 audit: every file under public/data/apache-kafka must appear exactly once in KAFKA_CURRICULUM (curriculum.ts).
 * Run: node scripts/verify-apache-kafka-audit.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'public', 'data', 'apache-kafka');
const curriculumPath = path.join(__dirname, '..', 'src', 'content', 'apacheKafka', 'curriculum.ts');

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

function extractCurriculumPaths(src) {
  const paths = [];
  const re = /repoPath:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(src)) !== null) paths.push(m[1]);
  return paths;
}

const IGNORE_PATHS = new Set(['inventory.json', 'AUDIT.txt']);
const diskFiles = new Set(walkFiles(root).filter((p) => !IGNORE_PATHS.has(p)));
const curriculumSrc = fs.readFileSync(curriculumPath, 'utf8');
const curriculumPaths = extractCurriculumPaths(curriculumSrc);
const curriculumSet = new Set(curriculumPaths);

const lines = [];
lines.push('# Apache-Kafka integration audit');
lines.push('');
lines.push(`Disk files (excluding inventory.json): ${diskFiles.size}`);
lines.push(`Curriculum repoPath entries: ${curriculumPaths.length}`);
lines.push('');

let ok = true;
for (const p of [...diskFiles].sort()) {
  if (curriculumSet.has(p)) {
    lines.push(`✅ ${p} — present in curriculum`);
  } else {
    ok = false;
    lines.push(`❌ ${p} — MISSING from curriculum.ts`);
  }
}

for (const p of curriculumPaths) {
  if (!diskFiles.has(p)) {
    ok = false;
    lines.push(`❌ ${p} — MISSING on disk`);
  }
}

const composePath = path.join(root, 'enterprise-app', 'docker-compose.yml');
if (fs.existsSync(composePath)) {
  const c = fs.readFileSync(composePath, 'utf8');
  if (c.includes('prometheus.yml') && !fs.existsSync(path.join(root, 'enterprise-app', 'prometheus.yml'))) {
    lines.push('');
    lines.push('⚠ enterprise-app/docker-compose.yml references ./prometheus.yml — file not in repo tree (expected gap).');
  }
}

lines.push('');
lines.push(ok ? 'RESULT: PASS' : 'RESULT: FAIL');

const report = lines.join('\n');
console.log(report);
fs.writeFileSync(path.join(root, 'AUDIT.txt'), report, 'utf8');
process.exit(ok ? 0 : 1);
