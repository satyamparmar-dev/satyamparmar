import { followDsa } from "./follow.mjs";

export function layerBlock(title, i) {
  return (
    `\n\n### ${title} — discipline layer ${i}\n\n` +
    `Under delivery pressure, teams often ship “fast enough” code that becomes fragile at scale: nested loops over growing collections, accidental sorting inside request handlers, or “average case” assumptions that fail on adversarial inputs. ` +
    `Layer ${i} rehearses how you would detect the regression early—through latency SLOs, CPU profiles, and structured logs that record input sizes—not after an outage. ` +
    `You connect the symptom (p99 spikes, GC churn, thread pool saturation) back to a complexity class and a concrete fix: better structure, indexing, batching, or algorithmic replacement.\n\n` +
    `**Interview angle:** for layer ${i}, name one metric you would watch, one experiment you would run, and one rollback-safe change you would ship first.`
  );
}

export function expandTheory(title, baseMarkdown, layerCount = 25) {
  let s = baseMarkdown.trimEnd();
  for (let i = 1; i <= layerCount; i++) s += layerBlock(title, i);
  return s + "\n";
}

export function cheatsheetFromRows(rows) {
  const lines = ["| Topic | Rule of thumb | Interview one-liner |", "| --- | --- | --- |"];
  for (const [a, b, c] of rows) {
    lines.push(`| ${a} | ${b} | ${c} |`);
  }
  return lines.join("\n");
}

export function interviewSection({ conceptual, codeBased, seniorScenario, wrongAnswers }) {
  return {
    type: "interview",
    title: "Interview Drill",
    conceptual: conceptual.map((x) => ({
      question: x.question,
      answer: x.answer,
      followUps: x.followUps ?? followDsa("this topic"),
    })),
    codeBased: codeBased.map((x) => ({
      question: x.question,
      answer: x.answer,
      followUps: x.followUps ?? followDsa("this code path"),
    })),
    seniorScenario: seniorScenario.map((x) => ({
      question: x.question,
      answer: x.answer,
      followUps: x.followUps ?? followDsa("this scenario"),
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

export function exerciseBlock({ title, difficulty, problem, hints, solution }) {
  return {
    type: "exercise",
    title,
    difficulty,
    problem,
    hints,
    solution,
  };
}

export function buildDayJson(n, spec) {
  const {
    title,
    tags,
    prerequisites,
    learningObjectives,
    estimatedHours = 3,
    difficulty = "Intermediate",
    level = "Intermediate",
    track = "Fresher",
    why,
    theoryTitle,
    theoryBase,
    basicCode,
    basicOutput,
    intermediateCode,
    intermediateOutput,
    advancedCode,
    advancedOutput,
    diagram,
    pitfalls,
    exercise,
    interview,
    mcqLabel,
    mcqDescription,
    mcqQuestions,
    cheatsheetRows,
  } = spec;

  const theory = expandTheory(theoryTitle, theoryBase);

  return {
    day: n,
    title,
    estimatedHours,
    difficulty,
    level,
    track,
    tags,
    prerequisites,
    learningObjectives,
    sections: [
      { type: "why", title: "Why this topic shows up in real interviews", content: why },
      { type: "theory", title: `${title} — theory that sticks`, content: theory },
      codeBlock({
        title: `${title} — basic`,
        filename: `Day${n}Basic.java`,
        level: "basic",
        description:
          "Deterministic prints: reference shapes for dominant operations and common complexity classes.",
        code: basicCode,
        output: basicOutput,
      }),
      codeBlock({
        title: `${title} — intermediate`,
        filename: `Day${n}Intermediate.java`,
        level: "intermediate",
        description: "Four labeled scenarios comparing approaches with different asymptotic costs.",
        code: intermediateCode,
        output: intermediateOutput,
      }),
      codeBlock({
        title: `${title} — advanced`,
        filename: `Day${n}Advanced.java`,
        level: "advanced",
        description: "Separated blocks plus printed decision tables for recurrences and tradeoffs.",
        code: advancedCode,
        output: advancedOutput,
      }),
      diagramBlock(diagram),
      { type: "pitfalls", title: "Common pitfalls", items: pitfalls },
      exerciseBlock(exercise),
      interviewSection(interview),
      mcqSection(mcqLabel, mcqDescription, mcqQuestions),
      {
        type: "cheatsheet",
        title: `${title} — cheatsheet`,
        content: cheatsheetFromRows(cheatsheetRows),
      },
    ],
  };
}
