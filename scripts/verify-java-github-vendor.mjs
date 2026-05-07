import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'public', 'data', 'java-github');
const manifestPath = path.join(root, 'vendor-manifest.json');

const curriculumPaths = [
  'GETTING_STARTED.md',
  'README.md',
  'SUMMARY.md',
  'src/main/java/com/example/streams/StreamBasics.java',
  'src/main/java/com/example/streams/AdvancedCollectors.java',
  'src/main/java/com/example/functional/FunctionalInterfacesDemo.java',
  'src/main/java/com/example/optional/OptionalExamples.java',
  'ARCHITECTURE_DIAGRAMS.md',
  'INTERVIEW_QUESTIONS.md',
  'src/main/java/com/example/enterprise/OrderProcessingService.java',
  'SCENARIO_BASED_QA_INDEX.md',
  'SCENARIO_BASED_QA_PART1.md',
  'SCENARIO_BASED_QA_PART2.md',
  'SCENARIO_BASED_QA_PART3.md',
  'SENIOR_JAVA_INTERVIEW_INDEX.md',
  'SENIOR_JAVA_INTERVIEW_PART1.md',
  'SENIOR_JAVA_INTERVIEW_PART2.md',
  'SENIOR_JAVA_INTERVIEW_PART3.md',
];

const auditOnly = ['pom.xml'];

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const paths = new Set(manifest.files.map((f) => f.path));

const expected = [...curriculumPaths, ...auditOnly];
let ok = true;
for (const p of expected) {
  if (!paths.has(p)) {
    console.error('Missing in vendor-manifest:', p);
    ok = false;
  }
  const full = path.join(root, ...p.split('/'));
  if (!fs.existsSync(full)) {
    console.error('Missing on disk:', p);
    ok = false;
  }
}

for (const p of paths) {
  if (p === 'vendor-manifest.json') continue;
  if (!expected.includes(p)) {
    console.error('Unexpected file in manifest (not in curriculum + audit list):', p);
    ok = false;
  }
}

for (const f of manifest.files) {
  const full = path.join(root, ...f.path.split('/'));
  const buf = fs.readFileSync(full);
  const sha = crypto.createHash('sha256').update(buf).digest('hex');
  if (sha !== f.sha256) {
    console.error('SHA256 mismatch for', f.path);
    ok = false;
  }
}

if (!ok) process.exit(1);
console.log('verify-java-github-vendor: OK —', expected.length, 'expected files present, manifest aligned, SHA256 verified.');
