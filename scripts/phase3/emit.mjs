import fs from "node:fs";
import path from "node:path";
import { buildDayJson } from "./build.mjs";

import spec19 from "./specs/day19/index.mjs";
import spec20 from "./specs/day20/index.mjs";
import spec21 from "./specs/day21/index.mjs";
import spec22 from "./specs/day22/index.mjs";
import spec23 from "./specs/day23/index.mjs";
import spec24 from "./specs/day24/index.mjs";
import spec25 from "./specs/day25/index.mjs";
import spec26 from "./specs/day26/index.mjs";
import spec27 from "./specs/day27/index.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const outDir = path.join(root, "public", "data", "days");

const MAP = {
  19: spec19,
  20: spec20,
  21: spec21,
  22: spec22,
  23: spec23,
  24: spec24,
  25: spec25,
  26: spec26,
  27: spec27,
};

for (const n of Object.keys(MAP).map(Number).sort((a, b) => a - b)) {
  const json = buildDayJson(n, MAP[n]);
  const p = path.join(outDir, `phase3-day${n}.json`);
  fs.writeFileSync(p, `${JSON.stringify(json, null, 2)}\n`, "utf8");
  console.log("wrote", p);
}
