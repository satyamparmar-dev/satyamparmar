import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const daysDir = path.join(root, "public", "data", "days");

const EXPECTED_ORDER = [
  "why",
  "theory",
  "code",
  "code",
  "code",
  "diagram",
  "pitfalls",
  "exercise",
  "interview",
  "mcq",
  "cheatsheet",
];

function validateDay(n) {
  const file = path.join(daysDir, `phase4-day${n}.json`);
  const raw = fs.readFileSync(file, "utf8");
  JSON.parse(raw);
  const data = JSON.parse(raw);
  const types = (data.sections ?? []).map((s) => s.type);
  if (types.length !== EXPECTED_ORDER.length) {
    throw new Error(`day ${n}: expected ${EXPECTED_ORDER.length} sections, got ${types.length}`);
  }
  for (let i = 0; i < EXPECTED_ORDER.length; i++) {
    if (types[i] !== EXPECTED_ORDER[i]) {
      throw new Error(`day ${n}: section ${i} type ${types[i]} !== ${EXPECTED_ORDER[i]}`);
    }
  }
  const pit = data.sections.find((s) => s.type === "pitfalls");
  if ((pit?.items?.length ?? 0) !== 8) throw new Error(`day ${n}: pitfalls must be 8`);

  const iv = data.sections.find((s) => s.type === "interview");
  if ((iv?.conceptual?.length ?? 0) !== 17) throw new Error(`day ${n}: conceptual must be 17`);
  if ((iv?.codeBased?.length ?? 0) !== 12) throw new Error(`day ${n}: codeBased must be 12`);
  if ((iv?.seniorScenario?.length ?? 0) !== 6) throw new Error(`day ${n}: seniorScenario must be 6`);
  if ((iv?.wrongAnswers?.length ?? 0) !== 8) throw new Error(`day ${n}: wrongAnswers must be 8`);

  const mcq = data.sections.find((s) => s.type === "mcq");
  const qs = mcq?.questions ?? [];
  if (qs.length !== 30) throw new Error(`day ${n}: mcq questions must be 30`);
  for (let j = 0; j < 30; j++) {
    if (qs[j].id !== j + 1) throw new Error(`day ${n}: mcq id ${qs[j].id} at index ${j}`);
    const a = qs[j].answer;
    if (!["A", "B", "C", "D"].includes(a)) throw new Error(`day ${n}: bad answer ${a} at ${j + 1}`);
    for (const k of ["A", "B", "C", "D"]) {
      if (!qs[j].options?.[k]) throw new Error(`day ${n}: missing option ${k} at mcq ${j + 1}`);
    }
  }

  const ch = data.sections.find((s) => s.type === "cheatsheet");
  const lines = (ch?.content ?? "").trim().split("\n").filter(Boolean);
  const dataRows = lines.length > 2 ? lines.length - 2 : 0;
  if (dataRows !== 15) throw new Error(`day ${n}: cheatsheet expects 15 data rows (+ header), got ${dataRows}`);

  const codes = data.sections.filter((s) => s.type === "code");
  for (const c of codes) {
    for (const k of ["language", "filename", "code", "level"]) {
      if (c[k] == null || c[k] === "") throw new Error(`day ${n}: code section missing ${k}`);
    }
  }

  const ex = data.sections.find((s) => s.type === "exercise");
  if (!ex?.problem || !ex?.solution) throw new Error(`day ${n}: exercise problem/solution required`);
  if ((ex.hints?.length ?? 0) < 3) throw new Error(`day ${n}: exercise needs 3+ hints`);

  console.log(`OK phase4-day${n}.json`);
}

const nums = process.argv.slice(2).map(Number).filter((n) => !Number.isNaN(n));
const run = nums.length ? nums : [28, 29, 30, 31, 32, 33, 34, 35, 36, 37];
for (const n of run) validateDay(n);
console.log("All requested days passed.");
