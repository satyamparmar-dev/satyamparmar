import fs from "node:fs";
import path from "node:path";
import { buildDayJson } from "./build.mjs";

import spec39 from "./specs/day39/index.mjs";
import spec40 from "./specs/day40/index.mjs";
import spec41 from "./specs/day41/index.mjs";
import spec42 from "./specs/day42/index.mjs";
import spec43 from "./specs/day43/index.mjs";
import spec44 from "./specs/day44/index.mjs";
import spec45 from "./specs/day45/index.mjs";
import spec46 from "./specs/day46/index.mjs";
import spec47 from "./specs/day47/index.mjs";
import spec48 from "./specs/day48/index.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const outDir = path.join(root, "public", "data", "days");

const MAP = {
  39: spec39,
  40: spec40,
  41: spec41,
  42: spec42,
  43: spec43,
  44: spec44,
  45: spec45,
  46: spec46,
  47: spec47,
  48: spec48,
};

for (const n of Object.keys(MAP).map(Number).sort((a, b) => a - b)) {
  const json = buildDayJson(n, MAP[n]);
  const p = path.join(outDir, `phase5-day${n}.json`);
  fs.writeFileSync(p, `${JSON.stringify(json, null, 2)}\n`, "utf8");
  console.log("wrote", p);
}
