import fs from "node:fs";
import path from "node:path";
import { buildDayJson } from "./build.mjs";

import spec28 from "./specs/day28/index.mjs";
import spec29 from "./specs/day29/index.mjs";
import spec30 from "./specs/day30/index.mjs";
import spec31 from "./specs/day31/index.mjs";
import spec32 from "./specs/day32/index.mjs";
import spec33 from "./specs/day33/index.mjs";
import spec34 from "./specs/day34/index.mjs";
import spec35 from "./specs/day35/index.mjs";
import spec36 from "./specs/day36/index.mjs";
import spec37 from "./specs/day37/index.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const outDir = path.join(root, "public", "data", "days");

const MAP = {
  28: spec28,
  29: spec29,
  30: spec30,
  31: spec31,
  32: spec32,
  33: spec33,
  34: spec34,
  35: spec35,
  36: spec36,
  37: spec37,
};

for (const n of Object.keys(MAP).map(Number).sort((a, b) => a - b)) {
  const json = buildDayJson(n, MAP[n]);
  const p = path.join(outDir, `phase4-day${n}.json`);
  fs.writeFileSync(p, `${JSON.stringify(json, null, 2)}\n`, "utf8");
  console.log("wrote", p);
}
