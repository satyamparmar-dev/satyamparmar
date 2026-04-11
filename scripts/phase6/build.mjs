import { followApi } from "./follow.mjs";

/** Phase 6: keep theory as authored — no generic layer padding. */
export function expandTheory(_title, baseMarkdown, layerCount = 0) {
  let s = baseMarkdown.trimEnd();
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
      followUps: x.followUps ?? followApi("this topic"),
    })),
    codeBased: codeBased.map((x) => ({
      question: x.question,
      answer: x.answer,
      followUps: x.followUps ?? followApi("this code path"),
    })),
    seniorScenario: seniorScenario.map((x) => ({
      question: x.question,
      answer: x.answer,
      followUps: x.followUps ?? followApi("this scenario"),
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

  const theory = expandTheory(theoryTitle, theoryBase, 0);

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
        description: "Plain Java reference output aligned with REST/API concepts for this day.",
        code: basicCode,
        output: basicOutput,
      }),
      codeBlock({
        title: `${title} — intermediate`,
        filename: `Day${n}Intermediate.java`,
        level: "intermediate",
        description: "Scenarios and simulations mirroring production API behavior.",
        code: intermediateCode,
        output: intermediateOutput,
      }),
      codeBlock({
        title: `${title} — advanced`,
        filename: `Day${n}Advanced.java`,
        level: "advanced",
        description: "Combined patterns: errors, pagination, contracts, or trade-off tables.",
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
