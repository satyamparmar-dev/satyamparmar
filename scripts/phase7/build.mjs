import { followConceptual, followCode, followSenior } from "./follow.mjs";
import { extraInterviewForDay } from "./lib/extraInterview.mjs";
import { cheatsheetRowsFromMarkdown } from "./lib/parseCheatsheet.mjs";

/** Phase 7: keep authored theory as-is (no generic padding layers). */
export function expandTheory(_title, baseMarkdown, _layerCount = 0) {
  return `${String(baseMarkdown).trimEnd()}\n`;
}

export function cheatsheetFromRows(rows) {
  const lines = ["| Topic | Rule of thumb | Interview one-liner |", "| --- | --- | --- |"];
  for (const [a, b, c] of rows) {
    lines.push(`| ${a} | ${b} | ${c} |`);
  }
  return lines.join("\n");
}

function stripInterviewItems(items) {
  return (items ?? []).map(({ question, answer }) => ({ question, answer }));
}

function mergeInterviewCounts(iv, day) {
  let conceptual = stripInterviewItems(iv.conceptual);
  let codeBased = stripInterviewItems(iv.codeBased);
  const ex = extraInterviewForDay(day);
  if (conceptual.length < 17) {
    conceptual = [...conceptual, ...ex.conceptual.slice(0, 17 - conceptual.length)];
  }
  if (codeBased.length < 12) {
    codeBased = [...codeBased, ...ex.codeBased.slice(0, 12 - codeBased.length)];
  }
  return {
    conceptual,
    codeBased,
    seniorScenario: stripInterviewItems(iv.seniorScenario),
    wrongAnswers: [...(iv.wrongAnswers ?? [])],
  };
}

export function interviewSection(merged) {
  const { conceptual, codeBased, seniorScenario, wrongAnswers } = merged;
  return {
    type: "interview",
    title: "Interview Drill",
    conceptual: conceptual.map((x) => ({
      question: x.question,
      answer: x.answer,
      followUps: followConceptual(x.question),
    })),
    codeBased: codeBased.map((x) => ({
      question: x.question,
      answer: x.answer,
      followUps: followCode(x.answer),
    })),
    seniorScenario: seniorScenario.map((x) => ({
      question: x.question,
      answer: x.answer,
      followUps: followSenior(x.question),
    })),
    wrongAnswers,
  };
}

export function mcqSection(label, description, questions) {
  return {
    type: "mcq",
    title: `MCQ Quiz — ${label}`,
    description,
    questions: questions.map((q, i) => ({ id: i + 1, ...q })),
  };
}

export function useCasesBlock(title, content) {
  return {
    type: "useCases",
    title,
    content,
  };
}

export function codeBlock({ title, filename, level, description, code, output }) {
  return {
    type: "code",
    title,
    language: "java",
    filename,
    level,
    description,
    code,
    ...(output != null ? { output } : {}),
  };
}

export function diagramBlock({ title, diagramType, description, plantuml }) {
  return {
    type: "diagram",
    title,
    diagramType,
    description,
    plantuml,
  };
}

function ensureHints(hints) {
  const base = [...(hints ?? [])];
  const pad = [
    "Name one **metric** and one **config** you would check on-call for this day’s topic.",
    "State a **failure mode** (e.g. rebalance, ISR shrink, schema break) tied to your answer.",
    "Keep **exact output** requirements from the assignment if this exercise mirrors the coding drill.",
  ];
  let i = 0;
  while (base.length < 3) {
    base.push(pad[i % pad.length]);
    i += 1;
  }
  return base;
}

export function exerciseBlock(cfgExercise) {
  return {
    type: "exercise",
    title: `Exercise — ${cfgExercise.titleSuffix}`,
    difficulty: cfgExercise.difficulty ?? "Advanced",
    problem: cfgExercise.problem,
    hints: ensureHints(cfgExercise.hints),
    solution: cfgExercise.solution,
  };
}

/**
 * @param {number} n day number
 * @param {{ cfg: object, useCasesMarkdown: string, mcqQuestions: object[] }} spec
 */
export function buildDayJson(n, spec) {
  const { cfg, useCasesMarkdown, mcqQuestions } = spec;
  const [basic, inter, adv] = cfg.codes;
  const theory = expandTheory(cfg.title, cfg.theory, 0);
  const mergedIv = mergeInterviewCounts(cfg.interview, n);
  const cheatsheetRows = cheatsheetRowsFromMarkdown(cfg.cheatsheet);

  return {
    day: n,
    title: cfg.title,
    estimatedHours: cfg.estimatedHours ?? 4,
    difficulty: cfg.difficulty ?? "Advanced",
    level: cfg.level ?? "Advanced",
    track: cfg.track ?? "Mid-Level",
    tags: cfg.tags,
    prerequisites: cfg.prerequisites,
    learningObjectives: cfg.learningObjectives,
    sections: [
      { type: "why", title: `Why ${cfg.title} matters`, content: cfg.why },
      { type: "theory", title: `Theory and Internals - ${cfg.title}`, content: theory },
      codeBlock({
        title: basic.title,
        filename: basic.filename,
        level: "basic",
        description: basic.description,
        code: basic.code,
        output: basic.output,
      }),
      codeBlock({
        title: inter.title,
        filename: inter.filename,
        level: "intermediate",
        description: inter.description,
        code: inter.code,
        output: inter.output,
      }),
      codeBlock({
        title: adv.title,
        filename: adv.filename,
        level: "advanced",
        description: adv.description,
        code: adv.code,
        output: adv.output,
      }),
      diagramBlock({
        title: cfg.diagram.title,
        diagramType: "component",
        description: cfg.diagram.description,
        plantuml: cfg.diagram.plantuml,
      }),
      { type: "pitfalls", title: "Common Pitfalls", items: cfg.pitfalls },
      exerciseBlock(cfg.exercise),
      useCasesBlock(`Use cases — ${cfg.title}`, useCasesMarkdown),
      interviewSection(mergedIv),
      mcqSection(
        cfg.title,
        `Thirty questions from basic to advanced — ${cfg.title}. Read every option; distractors are plausible but wrong for a precise reason.`,
        mcqQuestions,
      ),
      {
        type: "cheatsheet",
        title: `${cfg.title} — cheatsheet`,
        content: cheatsheetFromRows(cheatsheetRows),
      },
    ],
  };
}
