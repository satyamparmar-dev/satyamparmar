import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'public', 'data', 'java-github');

function walk(dir, base = '') {
  const out = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(base, name.name);
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      out.push(...walk(full, rel));
    } else if (name.isFile()) {
      if (name.name === 'vendor-manifest.json') continue;
      out.push(rel.split(path.sep).join('/'));
    }
  }
  return out;
}

const files = walk(root).sort();
const entries = files.map((rel) => {
  const full = path.join(root, ...rel.split('/'));
  const buf = fs.readFileSync(full);
  const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
  const text = buf.toString('utf8');
  const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0) ?? '';
  return {
    path: rel,
    sizeBytes: buf.length,
    sha256,
    excerpt: firstLine.slice(0, 240),
  };
});

const manifest = {
  sourceRepo: 'https://github.com/Satyverse-Satyam-Parmar/Java',
  branch: 'main',
  generatedAt: new Date().toISOString(),
  files: entries,
};

fs.writeFileSync(
  path.join(root, 'vendor-manifest.json'),
  JSON.stringify(manifest, null, 2),
  'utf8'
);
console.log('Wrote vendor-manifest.json with', entries.length, 'files');
