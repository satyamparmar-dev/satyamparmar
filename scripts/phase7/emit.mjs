import fs from "node:fs";
import path from "node:path";
import { buildDayJson } from "./build.mjs";

import spec59 from "./specs/day59/index.mjs";
import spec60 from "./specs/day60/index.mjs";
import spec61 from "./specs/day61/index.mjs";
import spec62 from "./specs/day62/index.mjs";
import spec63 from "./specs/day63/index.mjs";
import spec64 from "./specs/day64/index.mjs";
import spec65 from "./specs/day65/index.mjs";
import spec66 from "./specs/day66/index.mjs";
import spec67 from "./specs/day67/index.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const outDir = path.join(root, "public", "data", "days");

const MAP = {
  59: spec59,
  60: spec60,
  61: spec61,
  62: spec62,
  63: spec63,
  64: spec64,
  65: spec65,
  66: spec66,
  67: spec67,
};

for (const n of Object.keys(MAP)
  .map(Number)
  .sort((a, b) => a - b)) {
  const json = buildDayJson(n, MAP[n]);
  const p = path.join(outDir, `phase7-day${n}.json`);
  fs.writeFileSync(p, `${JSON.stringify(json, null, 2)}\n`, "utf8");
  console.log("wrote", p);
}
