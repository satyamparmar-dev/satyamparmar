/**
 * Transforms Phase 6 day files to match the correct TypeScript schema:
 *  - code sections:      content (with fences) → code/language/filename/level
 *  - mcq sections:       q/correct/answer(int)/array-options → question/answer(letter)/object-options + id/level/category
 *  - exercise sections:  content → problem/hints/solution/difficulty
 *  - interview sections: content string → conceptual[]/codeBased[]/seniorScenario[]/wrongAnswers[]
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const DAYS_DIR = join(__dir, '..', 'public', 'data', 'ai-curriculum', 'days');
const LETTERS = ['A', 'B', 'C', 'D'];

const files = readdirSync(DAYS_DIR)
  .filter(f => f.startsWith('phase6-day') && f.endsWith('.json'))
  .sort();

for (const file of files) {
  const filePath = join(DAYS_DIR, file);
  const data = JSON.parse(readFileSync(filePath, 'utf8'));
  data.sections = data.sections.map(transformSection);
  writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✓ ${file}`);
}

// ─────────────────────────────────────────────────────────────
function transformSection(s) {
  switch (s.type) {
    case 'code':      return transformCode(s);
    case 'mcq':       return transformMcq(s);
    case 'exercise':  return transformExercise(s);
    case 'interview': return transformInterview(s);
    default:          return s;
  }
}

// ── Code ──────────────────────────────────────────────────────
function transformCode(s) {
  if (s.code !== undefined) return s; // already correct

  const raw = s.content || '';
  // Strip ```lang\n...\n``` fences
  const fenceMatch = raw.match(/^```([\w-]*)\n([\s\S]*?)\n?```\s*$/);
  const code = fenceMatch ? fenceMatch[2] : raw;
  const lang = fenceMatch && fenceMatch[1] ? fenceMatch[1] : 'python';
  const ext = lang === 'java' ? 'java' : lang === 'javascript' || lang === 'typescript' ? 'ts' : 'py';
  const fname = (s.title || 'code')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .substring(0, 30) + '.' + ext;

  return {
    type: 'code',
    title: s.title,
    ...(s.description ? { description: s.description } : {}),
    language: lang,
    filename: fname,
    code,
    level: 'advanced',
  };
}

// ── MCQ ───────────────────────────────────────────────────────
function transformMcq(s) {
  if (!Array.isArray(s.questions)) return s;

  const questions = s.questions.map((q, i) => {
    // Already correct: has id, level, category, question (not q), options as object
    if (
      q.id !== undefined &&
      q.level !== undefined &&
      q.question !== undefined &&
      !Array.isArray(q.options)
    ) return q;

    const question = q.question ?? q.q ?? '';
    const rawAnswer = q.answer ?? q.correct ?? 0;
    const answerLetter =
      typeof rawAnswer === 'number'
        ? LETTERS[rawAnswer] ?? 'A'
        : LETTERS.includes(rawAnswer)
        ? rawAnswer
        : 'A';

    let options;
    if (Array.isArray(q.options)) {
      options = {
        A: q.options[0] ?? '',
        B: q.options[1] ?? '',
        C: q.options[2] ?? '',
        D: q.options[3] ?? '',
      };
    } else if (q.options && typeof q.options === 'object') {
      options = q.options;
    } else {
      options = { A: '', B: '', C: '', D: '' };
    }

    return {
      id: i + 1,
      level: q.level ?? 'intermediate',
      category: q.category ?? 'theory',
      question,
      options,
      answer: answerLetter,
      explanation: q.explanation ?? '',
    };
  });

  return {
    type: 'mcq',
    title: s.title,
    ...(s.description ? { description: s.description } : {}),
    questions,
  };
}

// ── Exercise ──────────────────────────────────────────────────
function transformExercise(s) {
  if (s.problem !== undefined) return s; // already correct
  return {
    type: 'exercise',
    title: s.title,
    difficulty: s.difficulty ?? 'Advanced',
    problem: s.content ?? '',
    hints: s.hints ?? [],
    solution: s.solution ?? '',
  };
}

// ── Interview ─────────────────────────────────────────────────
function transformInterview(s) {
  if (s.conceptual !== undefined) return s; // already correct

  const content = s.content ?? '';
  const conceptual = [];
  const codeBased = [];
  const seniorScenario = [];
  const wrongAnswers = [];

  if (content) {
    // Split on section headers (lines starting with **Conceptual, **Code, **Senior, **Wrong)
    // Handle two patterns:
    //   Pattern A: "**Conceptual:**\nQ: ...\nA: ..."
    //   Pattern B: "**Conceptual**: Question text\n\n**Answer**: ..."
    const parts = content.split(/(?=\n?\*\*(?:Conceptual|Code[-\s]?based|Code-based|Senior|Wrong))/i)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    for (const part of parts) {
      const isConceptual   = /^\*\*Conceptual/i.test(part);
      const isCodeBased    = /^\*\*Code[-\s]?based/i.test(part);
      const isSenior       = /^\*\*Senior/i.test(part);
      const isWrong        = /^\*\*Wrong/i.test(part);

      if (isWrong) {
        // Strip leading header
        const body = part.replace(/^\*\*[^*\n]+\*\*:?\s*\n?/, '').trim();
        wrongAnswers.push(body || part);
        continue;
      }

      const qa = parseQA(part);
      if (!qa) continue;

      if (isConceptual)   conceptual.push(qa);
      else if (isCodeBased) codeBased.push(qa);
      else if (isSenior)  seniorScenario.push(qa);
    }

    // Fallback: if nothing parsed, put whole content in conceptual
    if (!conceptual.length && !codeBased.length && !seniorScenario.length) {
      conceptual.push({ question: 'Review interview questions for this topic', answer: content });
    }
  }

  return {
    type: 'interview',
    title: s.title,
    conceptual,
    codeBased,
    seniorScenario,
    wrongAnswers,
  };
}

/**
 * Parse a section block into {question, answer}.
 * Handles:
 *   A) "**Section:**\nQ: question\nA: answer"
 *   B) "**Section**: question\n\n**Answer**: answer"
 *   C) "**Section** — question\n\n**Answer**: answer"
 */
function parseQA(text) {
  const lines = text.split('\n');

  // Pattern A: Q: ... \n A: ...
  const qAMatch = text.match(/Q:\s*([\s\S]+?)\nA:\s*([\s\S]+?)(?=\n\n\*\*|$)/);
  if (qAMatch) {
    return { question: qAMatch[1].trim(), answer: qAMatch[2].trim() };
  }

  // Pattern B: header line has the question after **: or **:
  const headerLine = lines[0];
  const rest = lines.slice(1).join('\n').trim();

  // Extract question from header: "**Conceptual**: Question text" or "**Conceptual:** Question text"
  const headerQ = headerLine
    .replace(/^\*\*(?:Conceptual|Code[-\s]?based|Code-based|Senior\s*scenario)[^:*]*\*\*:?\s*/i, '')
    .trim();

  // Try to find **Answer**: in the rest
  const answerMatch = rest.match(/\*\*Answer(?:\s*sketch)?(?:\s*\(.*?\))?\*\*:?\s*([\s\S]+?)(?=\n\n\*\*|$)/i);
  if (answerMatch) {
    const q = headerQ || rest.split('\n\n')[0].trim();
    return { question: q, answer: answerMatch[1].trim() };
  }

  // Fallback: question = headerQ or first paragraph, answer = rest
  if (headerQ && rest) {
    return { question: headerQ, answer: rest };
  }

  if (rest) {
    const paras = rest.split('\n\n');
    return { question: paras[0].trim(), answer: paras.slice(1).join('\n\n').trim() || rest };
  }

  return null;
}
