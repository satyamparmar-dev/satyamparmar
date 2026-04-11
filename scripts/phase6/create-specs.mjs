/**
 * One-time: build scripts/phase6/specs/day{49..58} from existing public JSON.
 * Run: node scripts/phase6/create-specs.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extraInterviewForDay } from "./lib/extraInterview.mjs";
import { getMcqForDay } from "./lib/mcqAll.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");
const daysDir = path.join(root, "public", "data", "days");
const specsRoot = path.join(__dirname, "specs");

function parseCheatsheetRows(content) {
  const lines = content.trim().split("\n");
  const rows = [];
  for (const line of lines) {
    if (!line.startsWith("|")) continue;
    if (/^\|\s*---/.test(line)) continue;
    const cells = line
      .split("|")
      .map((s) => s.trim())
      .filter((c) => c.length > 0);
    if (cells.length >= 3 && cells[0] !== "Topic") {
      rows.push([cells[0], cells[1], cells[2]]);
    }
  }
  return rows;
}

const PAD_ROWS = [
  ["Trace id", "Propagate on every hop", "Debug 502/504 with correlation"],
  ["Timeouts", "Client < gateway < server", "Cancel work; avoid retry storms"],
  ["Payload size", "Cap upload; stream large", "Protect memory and threads"],
  ["Deprecation", "Sunset header + docs", "Give consumers a calendar"],
  ["Security", "Authn at edge; authz in service", "Do not trust gateway alone"],
];

function padCheatsheetRows(rows) {
  const out = [...rows];
  let i = 0;
  while (out.length < 15) {
    out.push(PAD_ROWS[i % PAD_ROWS.length]);
    i++;
  }
  return out.slice(0, 15);
}

function mergeInterview(iv, n) {
  const ex = extraInterviewForDay(n);
  const mapPair = (x) => ({ question: x.question, answer: x.answer });
  let conceptual = iv.conceptual.map(mapPair);
  let codeBased = iv.codeBased.map(mapPair);
  if (conceptual.length < 17) {
    conceptual = [...conceptual, ...ex.conceptual.slice(0, 17 - conceptual.length)];
  }
  if (codeBased.length < 12) {
    codeBased = [...codeBased, ...ex.codeBased.slice(0, 12 - codeBased.length)];
  }
  return {
    conceptual,
    codeBased,
    seniorScenario: iv.seniorScenario.map(mapPair),
    wrongAnswers: [...iv.wrongAnswers],
  };
}

function writeFile(p, text) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text, "utf8");
}

for (let n = 49; n <= 58; n++) {
  const jsonPath = path.join(daysDir, `phase6-day${n}.json`);
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const sections = data.sections;
  const whySec = sections.find((s) => s.type === "why");
  const theorySec = sections.find((s) => s.type === "theory");
  const codes = sections.filter((s) => s.type === "code");
  const diagramSec = sections.find((s) => s.type === "diagram");
  const pitSec = sections.find((s) => s.type === "pitfalls");
  const exSec = sections.find((s) => s.type === "exercise");
  const ivSec = sections.find((s) => s.type === "interview");
  const chSec = sections.find((s) => s.type === "cheatsheet");

  if (codes.length !== 3) throw new Error(`day ${n}: expected 3 code sections`);

  const dir = path.join(specsRoot, `day${n}`);

  const theoryTitle = data.title;
  const theoryBase = theorySec.content;

  writeFile(
    path.join(dir, "theory.mjs"),
    `export const theoryTitle = ${JSON.stringify(theoryTitle)};\n\nexport const theoryBase = ${JSON.stringify(theoryBase)};\n`,
  );

  const [b, m, a] = codes;
  writeFile(
    path.join(dir, "codes.mjs"),
    `export const basicCode = ${JSON.stringify(b.code)};\n\nexport const basicOutput = ${JSON.stringify(b.output ?? "")};\n\nexport const intermediateCode = ${JSON.stringify(m.code)};\n\nexport const intermediateOutput = ${JSON.stringify(m.output ?? "")};\n\nexport const advancedCode = ${JSON.stringify(a.code)};\n\nexport const advancedOutput = ${JSON.stringify(a.output ?? "")};\n`,
  );

  const d = diagramSec;
  writeFile(
    path.join(dir, "diagram.mjs"),
    `export default {\n  title: ${JSON.stringify(d.title)},\n  diagramType: ${JSON.stringify(d.diagramType)},\n  description: ${JSON.stringify(d.description)},\n  plantuml: ${JSON.stringify(d.plantuml)},\n};\n`,
  );

  const interview = mergeInterview(ivSec, n);
  writeFile(path.join(dir, "interview.mjs"), `export default ${JSON.stringify(interview, null, 2)};\n`);

  const mcq = getMcqForDay(n, data.title);
  writeFile(path.join(dir, "mcq.mjs"), `export default ${JSON.stringify(mcq, null, 2)};\n`);

  let cheatsheetRows = parseCheatsheetRows(chSec.content);
  cheatsheetRows = padCheatsheetRows(cheatsheetRows);

  const why = whySec.content;
  const pitfalls = pitSec.items;
  const exercise = {
    title: exSec.title,
    difficulty: exSec.difficulty ?? "Advanced",
    problem: exSec.problem,
    hints: exSec.hints ?? [],
    solution: exSec.solution,
  };
  if (exercise.hints.length < 3) {
    exercise.hints = [
      ...exercise.hints,
      "Relate your answer to production observability (logs, metrics, traces).",
      "Name one trade-off and when you would choose differently.",
      "Keep HTTP semantics and client retry behavior explicit.",
    ].slice(0, Math.max(3, exercise.hints.length));
  }

  const indexBody = `import { theoryTitle, theoryBase } from "./theory.mjs";
import {
  basicCode,
  basicOutput,
  intermediateCode,
  intermediateOutput,
  advancedCode,
  advancedOutput,
} from "./codes.mjs";
import diagram from "./diagram.mjs";
import mcqQuestions from "./mcq.mjs";
import interview from "./interview.mjs";

const why = ${JSON.stringify(why)};

const pitfalls = ${JSON.stringify(pitfalls, null, 2)};

const exercise = ${JSON.stringify(exercise, null, 2)};

const cheatsheetRows = ${JSON.stringify(cheatsheetRows, null, 2)};

export default {
  title: ${JSON.stringify(data.title)},
  tags: ${JSON.stringify(data.tags)},
  prerequisites: ${JSON.stringify(data.prerequisites)},
  learningObjectives: ${JSON.stringify(data.learningObjectives)},
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
  mcqLabel: ${JSON.stringify(data.title)},
  mcqDescription: ${JSON.stringify(`Thirty questions from basic to advanced — ${data.title}. Read every option; distractors are plausible but wrong for a precise reason.`)},
  mcqQuestions,
  cheatsheetRows,
};
`;

  writeFile(path.join(dir, "index.mjs"), indexBody);
  console.log("wrote specs/day" + n);
}

console.log("done");
