import fs from "node:fs";
import path from "node:path";
import { buildDayJson } from "./build.mjs";

import spec49 from "./specs/day49/index.mjs";
import spec50 from "./specs/day50/index.mjs";
import spec51 from "./specs/day51/index.mjs";
import spec52 from "./specs/day52/index.mjs";
import spec53 from "./specs/day53/index.mjs";
import spec54 from "./specs/day54/index.mjs";
import spec55 from "./specs/day55/index.mjs";
import spec56 from "./specs/day56/index.mjs";
import spec57 from "./specs/day57/index.mjs";
import spec58 from "./specs/day58/index.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const outDir = path.join(root, "public", "data", "days");

const MAP = {
  49: spec49,
  50: spec50,
  51: spec51,
  52: spec52,
  53: spec53,
  54: spec54,
  55: spec55,
  56: spec56,
  57: spec57,
  58: spec58,
};

for (const n of Object.keys(MAP).map(Number).sort((a, b) => a - b)) {
  const json = buildDayJson(n, MAP[n]);
  const p = path.join(outDir, `phase6-day${n}.json`);
  fs.writeFileSync(p, `${JSON.stringify(json, null, 2)}\n`, "utf8");
  console.log("wrote", p);
}
