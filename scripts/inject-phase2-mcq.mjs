/**
 * Inserts MCQ sections from phase2-mcq-bundle.json into phase2-day10..18.json
 * before cheatsheet. Run after: node scripts/gen-phase2-mcq.mjs
 */
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const daysDir = join(__dirname, "../public/data/days");
const bundlePath = join(__dirname, "../public/data/phase2-mcq-bundle.json");

const bundle = JSON.parse(fs.readFileSync(bundlePath, "utf8"));

for (const dayKey of Object.keys(bundle).sort((a, b) => Number(a) - Number(b))) {
  const filePath = join(daysDir, `phase2-day${dayKey}.json`);
  const j = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const types = j.sections.map((s) => s.type);
  const cheatsheetIdx = types.indexOf("cheatsheet");
  const interviewIdx = types.indexOf("interview");
  if (cheatsheetIdx < 0) throw new Error(`${filePath}: no cheatsheet`);
  if (interviewIdx < 0) throw new Error(`${filePath}: no interview`);

  const mcqIdx = types.indexOf("mcq");
  if (mcqIdx >= 0) {
    j.sections[mcqIdx] = bundle[dayKey];
    console.log("replace mcq day", dayKey);
  } else {
    if (cheatsheetIdx !== interviewIdx + 1) {
      console.warn("warn day", dayKey, "expected interview immediately before cheatsheet, got:", types.slice(interviewIdx, interviewIdx + 3));
    }
    j.sections.splice(cheatsheetIdx, 0, bundle[dayKey]);
    console.log("insert mcq day", dayKey);
  }

  const t2 = j.sections.map((s) => s.type);
  const mcqI = t2.indexOf("mcq");
  const chI = t2.indexOf("cheatsheet");
  if (mcqI < 0 || chI !== mcqI + 1) throw new Error(`${filePath}: mcq must be immediately before cheatsheet`);
  const qn = j.sections[mcqI].questions?.length;
  if (qn !== 30) throw new Error(`${filePath}: expected 30 mcq questions, got ${qn}`);

  fs.writeFileSync(filePath, JSON.stringify(j, null, 2) + "\n");
}

console.log("inject-phase2-mcq done");
