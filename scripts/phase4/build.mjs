import { followJava } from "./follow.mjs";

export function layerBlock(title, i) {
  return (
    `\n\n### ${title} — engineering layer ${i}\n\n` +
    `Under delivery pressure, Java backends accumulate quiet technical debt: raw types slipping past code review, streams that allocate more than expected, locks taken in inconsistent order, or modern syntax used without a clear migration story. ` +
    `Layer ${i} rehearses how you would detect the regression before it becomes an outage—through JDK-aware CI, structured logs, JFR or async-profiler samples, and tests that assert invariants—not only happy-path compilation. ` +
    `You connect symptoms (Metaspace creep, STW pauses, pool starvation, flaky virtual-thread pinning) back to a language or runtime decision and a fix: clearer APIs, safer concurrency, better defaults, or JVM flags validated with before/after evidence.\n\n` +
    `**Interview angle:** for layer ${i}, name one spec-backed guarantee, one metric or dump you would inspect, and one backward-compatible change you would ship first.`
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
      followUps: x.followUps ?? followJava("this topic"),
    })),
    codeBased: codeBased.map((x) => ({
      question: x.question,
      answer: x.answer,
      followUps: x.followUps ?? followJava("this code path"),
    })),
    seniorScenario: seniorScenario.map((x) => ({
      question: x.question,
      answer: x.answer,
      followUps: x.followUps ?? followJava("this scenario"),
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
    track = "Mid-Level",
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
        description: "Deterministic reference: core syntax and one minimal end-to-end print.",
        code: basicCode,
        output: basicOutput,
      }),
      codeBlock({
        title: `${title} — intermediate`,
        filename: `Day${n}Intermediate.java`,
        level: "intermediate",
        description: "Four labeled scenarios contrasting APIs, safety, and readability.",
        code: intermediateCode,
        output: intermediateOutput,
      }),
      codeBlock({
        title: `${title} — advanced`,
        filename: `Day${n}Advanced.java`,
        level: "advanced",
        description: "Three blocks plus printed decision or reference table for tradeoffs.",
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
