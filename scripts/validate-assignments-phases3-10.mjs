import fs from 'fs';
import path from 'path';

const base = path.join(process.cwd(), 'public', 'data');

for (let p = 3; p <= 10; p += 1) {
  const filePath = path.join(base, `assignments_phase${p}.json`);
  const f = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const [day, a] of Object.entries(f.assignments)) {
    if (a.totalPoints !== 100) throw new Error(`phase${p} day${day} totalPoints`);
    if (!Array.isArray(a.questions) || a.questions.length !== 6) throw new Error(`phase${p} day${day} qlen`);
    const types = a.questions.map((q) => q.type).join(',');
    if (types !== 'conceptual,conceptual,scenario,coding,scenario,conceptual') {
      throw new Error(`phase${p} day${day} types`);
    }
    const pts = a.questions.reduce((n, q) => n + q.points, 0);
    if (pts !== 100) throw new Error(`phase${p} day${day} points`);
    a.questions.forEach((q, i) => {
      if (q.id !== `d${day}q${i + 1}`) throw new Error(`phase${p} day${day} id`);
      if (!Array.isArray(q.hints) || q.hints.length !== 3) throw new Error(`phase${p} day${day} hints`);
    });
    const coding = a.questions[3];
    if (!coding.codeTemplate || !coding.expectedOutput) throw new Error(`phase${p} day${day} coding fields`);
  }
}

console.log('assignment validation OK (phases 3-10)');
