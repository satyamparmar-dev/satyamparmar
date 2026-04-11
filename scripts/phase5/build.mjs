import { followSpring } from "./follow.mjs";

export function layerBlock(title, i) {
  return (
    `\n\n### ${title} — delivery layer ${i}\n\n` +
    `Under production load, Spring apps fail in predictable ways: beans finish construction before dependencies are ready, AOP advice order inverts your security assumptions, JPA issues N+1 queries that look fine in demos, and security matchers accidentally expose actuator or error endpoints. ` +
    `Layer ${i} rehearses how you would catch the defect before customers do—through focused integration tests, Hibernate statistics or datasource-proxy logging, structured security denies, and health checks that reflect real dependencies—not only green unit tests. ` +
    `You connect symptoms (connection pool exhaustion, 403 on valid tokens, stale reads under concurrency, WebClient blowing heap) back to a Spring concept and a fix: correct scope, explicit transaction boundaries, fetch joins, filter chains, or backpressure on reactive pipelines.\n\n` +
    `**Interview angle:** for layer ${i}, name one Spring Boot actuator or test slice you would use, one metric or log line you would watch, and one backward-compatible config change you would ship first.`
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
      followUps: x.followUps ?? followSpring("this topic"),
    })),
    codeBased: codeBased.map((x) => ({
      question: x.question,
      answer: x.answer,
      followUps: x.followUps ?? followSpring("this code path"),
    })),
    seniorScenario: seniorScenario.map((x) => ({
      question: x.question,
      answer: x.answer,
      followUps: x.followUps ?? followSpring("this scenario"),
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
    difficulty = "Advanced",
    level = "Advanced",
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
        description: "Deterministic reference: Spring concept distilled to plain Java prints.",
        code: basicCode,
        output: basicOutput,
      }),
      codeBlock({
        title: `${title} — intermediate`,
        filename: `Day${n}Intermediate.java`,
        level: "intermediate",
        description: "Four labeled scenarios contrasting lifecycle, wiring, or runtime behavior.",
        code: intermediateCode,
        output: intermediateOutput,
      }),
      codeBlock({
        title: `${title} — advanced`,
        filename: `Day${n}Advanced.java`,
        level: "advanced",
        description: "Three blocks plus printed decision table for tradeoffs.",
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
