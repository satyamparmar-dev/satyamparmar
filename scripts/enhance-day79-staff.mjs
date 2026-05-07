import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { buildDay79Sections } from './day79-builder.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, '..', 'public', 'data', 'days', 'phase9-day79.json');

const wordCount = (text) =>
  String(text || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[`*_>#-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

const codeLineCount = (code) => String(code || '').split('\n').length;
const h3Count = (t) => ((t || '').match(/^###\s+/gm) || []).length;
const angleCount = (t) => ((t || '').match(/\*\*Interview angle:\*\*/g) || []).length;
const tableCount = (t) => {
  const lines = (t || '').split('\n');
  let c = 0;
  for (let i = 0; i < lines.length - 1; i += 1) {
    if (/^\|/.test(lines[i]) && /^\|?\s*[-:|\s]+\|?\s*$/.test(lines[i + 1])) c += 1;
  }
  return c;
};
const cheatRows = (t) => Math.max(0, (t || '').split('\n').filter((l) => /^\|/.test(l)).length - 2);

const hasSeniorLabels = (answer) => {
  const labels = ['**Immediate response:**', '**Root cause:**', '**Fix:**', '**Prevention:**'];
  return labels.every((x) => String(answer || '').includes(x));
};

const isPlainWrongAnswers = (arr) =>
  Array.isArray(arr) &&
  arr.length === 8 &&
  arr.every((x) => typeof x === 'string' && x.length < 220 && !x.includes('Correction:'));

function verify(json) {
  const sections = json.sections || [];
  const why = sections.find((s) => s.type === 'why');
  const theory = sections.find((s) => s.type === 'theory');
  const codes = sections.filter((s) => s.type === 'code');
  const basic = codes.find((c) => c.level === 'basic');
  const mid = codes.find((c) => c.level === 'intermediate');
  const adv = codes.find((c) => c.level === 'advanced');
  const pitfalls = sections.find((s) => s.type === 'pitfalls');
  const exercises = sections.filter((s) => s.type === 'exercise');
  const interview = sections.find((s) => s.type === 'interview');
  const mcq = sections.find((s) => s.type === 'mcq');
  const cheat = sections.find((s) => s.type === 'cheatsheet');

  const conc = interview?.conceptual || [];
  const concWc = conc.map((c) => wordCount(c.answer));
  const sen = interview?.seniorScenario || [];
  const senWc = sen.map((s) => wordCount(s.answer));
  const jb = interview?.jobSwitch;
  const resumeWords = jb?.resumeBullet ? jb.resumeBullet.split(/\s+/).filter(Boolean).length : 0;
  const resumeOk =
    resumeWords > 0 &&
    resumeWords <= 20 &&
    /^[A-Z][a-z]+ed\b/.test(String(jb?.resumeBullet || '').trim());

  const mcqs = mcq?.questions || [];
  const codeBased = interview?.codeBased || [];
  const cbWc = codeBased.map((c) => wordCount(c.answer));

  const fresherEx = exercises.find((e) => e.audience === 'fresher');
  const staffEx = exercises.find((e) => e.audience === 'staff');

  return {
    whyWc: wordCount(why?.content),
    theoryH3: h3Count(theory?.content),
    pipes: tableCount(theory?.content),
    angles: angleCount(theory?.content),
    basicL: codeLineCount(basic?.code),
    midL: codeLineCount(mid?.code),
    advL: codeLineCount(adv?.code),
    scenarioCount: (mid?.code || '').match(/--- Scenario \d+:/g)?.length || 0,
    blockCount: (adv?.code || '').match(/=== Block \d+:/g)?.length || 0,
    pitfalls: pitfalls?.items?.length || 0,
    conceptualCount: conc.length,
    conceptualMin: concWc.length ? Math.min(...concWc) : 0,
    conceptualAvg: concWc.length ? concWc.reduce((a, b) => a + b, 0) / concWc.length : 0,
    conceptualWcs: concWc,
    codeBasedCount: codeBased.length,
    codeBasedMin: cbWc.length ? Math.min(...cbWc) : 0,
    seniorCount: sen.length,
    seniorWcs: senWc,
    seniorLabelsOk: sen.every((s) => hasSeniorLabels(s.answer)),
    wrongCount: interview?.wrongAnswers?.length || 0,
    plainWrong: isPlainWrongAnswers(interview?.wrongAnswers),
    jobSwitch: !!jb,
    resumeWords,
    resumeOk,
    mcqBasic: mcqs.filter((q) => q.level === 'basic').length,
    mcqInt: mcqs.filter((q) => q.level === 'intermediate').length,
    mcqAdv: mcqs.filter((q) => q.level === 'advanced').length,
    cheatRows: cheatRows(cheat?.content),
    exercises: exercises.length,
    hasFresherEx: !!fresherEx && /Day79FresherExercise/.test(fresherEx.solution || ''),
    hasStaffEx: !!staffEx && /Day79StaffExercise/.test(staffEx.solution || ''),
    staffSolLines: (staffEx?.solution || '').split('\n').length,
    fileChars: JSON.stringify(json).length
  };
}

function allPass(v) {
  return (
    v.whyWc >= 600 &&
    v.theoryH3 >= 16 &&
    v.pipes >= 3 &&
    v.angles >= 13 &&
    v.basicL >= 40 &&
    v.basicL <= 60 &&
    v.midL >= 70 &&
    v.midL <= 100 &&
    v.scenarioCount >= 4 &&
    v.blockCount >= 3 &&
    v.advL >= 60 &&
    v.advL <= 100 &&
    v.pitfalls === 8 &&
    v.conceptualCount >= 15 &&
    v.conceptualAvg >= 120 &&
    v.conceptualMin >= 120 &&
    v.codeBasedCount >= 8 &&
    v.codeBasedMin >= 60 &&
    v.seniorCount >= 5 &&
    v.seniorWcs.every((w) => w >= 200) &&
    v.seniorLabelsOk &&
    v.wrongCount === 8 &&
    v.plainWrong &&
    v.jobSwitch &&
    v.resumeOk &&
    v.mcqBasic === 8 &&
    v.mcqInt === 12 &&
    v.mcqAdv === 10 &&
    v.cheatRows >= 12 &&
    v.exercises >= 2 &&
    v.hasFresherEx &&
    v.hasStaffEx &&
    v.staffSolLines >= 50
  );
}

function bandCounts(theoryContent) {
  const L = (theoryContent || '').split('\n');
  const fresher = L.filter((l) =>
    /### (Plain-language|What is structural|Your first|When you sketch)/i.test(l)
  ).length;
  const senior = L.filter((l) =>
    /### (How composition|Comparison table|Step sequence|Common mistakes|When Decorator)/i.test(l)
  ).length;
  const tl = L.filter((l) => /### (Choosing|Code review|How to explain)/i.test(l)).length;
  const staff = L.filter((l) =>
    /### (What the JVM|jcmd and javap|Java 8 through 21|Architecture guardrail)/i.test(l)
  ).length;
  return { fresher, senior, tl, staff };
}

const json = JSON.parse(readFileSync(filePath, 'utf8'));
const before = verify(json);
let patched = false;
if (!allPass(before)) {
  const { day, title, estimatedHours, difficulty, level, track, tags, prerequisites, learningObjectives } = json;
  const next = {
    day,
    title,
    estimatedHours,
    difficulty,
    level,
    track,
    tags,
    prerequisites,
    learningObjectives,
    sections: buildDay79Sections()
  };
  Object.assign(json, next);
  patched = true;
}

const text = JSON.stringify(json, null, 2);
JSON.parse(text);
writeFileSync(filePath, text, 'utf8');

const out = JSON.parse(readFileSync(filePath, 'utf8'));
const v = verify(out);
const theory = out.sections.find((s) => s.type === 'theory');
const bands = bandCounts(theory?.content);

console.log('Patches applied:', patched ? 'full day 79 rebuild' : '(none)');
console.log('--- verification ---');
console.log('WHY word count:', v.whyWc);
console.log(
  'THEORY ### count:',
  v.theoryH3,
  '| bands (heuristic fresher/senior/tl/staff):',
  bands.fresher,
  bands.senior,
  bands.tl,
  bands.staff
);
console.log('THEORY pipe tables:', v.pipes, '| Interview angle lines:', v.angles);
console.log('Conceptual:', v.conceptualCount, '| word counts:', v.conceptualWcs.join(', '));
console.log('SeniorScenario:', v.seniorCount, '| word counts:', v.seniorWcs.join(', '), '| labels:', v.seniorLabelsOk);
console.log('JobSwitch:', v.jobSwitch, '| resumeOk:', v.resumeOk, '| resume words:', v.resumeWords);
console.log('MCQ basic / intermediate / advanced:', v.mcqBasic, v.mcqInt, v.mcqAdv);
console.log('Code line counts [basic, intermediate, advanced]:', v.basicL, v.midL, v.advL);
console.log('File size chars:', v.fileChars);

const pass = allPass(v);
if (!pass) {
  const keys = [
    'whyWc',
    'theoryH3',
    'pipes',
    'angles',
    'basicL',
    'midL',
    'advL',
    'scenarioCount',
    'blockCount',
    'pitfalls',
    'conceptualCount',
    'conceptualMin',
    'conceptualAvg',
    'codeBasedCount',
    'codeBasedMin',
    'seniorCount',
    'seniorLabelsOk',
    'wrongCount',
    'plainWrong',
    'jobSwitch',
    'resumeOk',
    'mcqBasic',
    'mcqInt',
    'mcqAdv',
    'cheatRows',
    'exercises',
    'hasFresherEx',
    'hasStaffEx',
    'staffSolLines'
  ];
  const failed = keys.filter((k) => {
    if (k === 'whyWc') return v.whyWc < 600;
    if (k === 'theoryH3') return v.theoryH3 < 16;
    if (k === 'pipes') return v.pipes < 3;
    if (k === 'angles') return v.angles < 13;
    if (k === 'basicL') return v.basicL < 40 || v.basicL > 60;
    if (k === 'midL') return v.midL < 70 || v.midL > 100;
    if (k === 'advL') return v.advL < 60 || v.advL > 100;
    if (k === 'scenarioCount') return v.scenarioCount < 4;
    if (k === 'blockCount') return v.blockCount < 3;
    if (k === 'pitfalls') return v.pitfalls !== 8;
    if (k === 'conceptualCount') return v.conceptualCount < 15;
    if (k === 'conceptualMin') return v.conceptualMin < 120;
    if (k === 'conceptualAvg') return v.conceptualAvg < 120;
    if (k === 'codeBasedCount') return v.codeBasedCount < 8;
    if (k === 'codeBasedMin') return v.codeBasedMin < 60;
    if (k === 'seniorCount') return v.seniorCount < 5;
    if (k === 'seniorLabelsOk') return !v.seniorLabelsOk;
    if (k === 'wrongCount') return v.wrongCount !== 8;
    if (k === 'plainWrong') return !v.plainWrong;
    if (k === 'jobSwitch') return !v.jobSwitch;
    if (k === 'resumeOk') return !v.resumeOk;
    if (k === 'mcqBasic') return v.mcqBasic !== 8;
    if (k === 'mcqInt') return v.mcqInt !== 12;
    if (k === 'mcqAdv') return v.mcqAdv !== 10;
    if (k === 'cheatRows') return v.cheatRows < 12;
    if (k === 'exercises') return v.exercises < 2;
    if (k === 'hasFresherEx') return !v.hasFresherEx;
    if (k === 'hasStaffEx') return !v.hasStaffEx;
    if (k === 'staffSolLines') return v.staffSolLines < 50;
    if (k === 'seniorWcs') return v.seniorWcs.some((x) => x < 200);
    return false;
  });
  if (v.seniorWcs.some((x) => x < 200)) failed.push('seniorMinWords');
  console.log('Failed:', [...new Set(failed)].join(', '));
}
console.log(pass ? 'ALL_CHECKS_PASS' : 'SOME_CHECKS_FAIL');
process.exit(pass ? 0 : 1);
