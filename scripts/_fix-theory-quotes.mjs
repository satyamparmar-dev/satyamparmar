import fs from "fs";

const path = "scripts/day10-staff-bundle.mjs";
let f = fs.readFileSync(path, "utf8");
const head = "export const THEORY_CONTENT = `";
const tailMarker = "export const BASIC_CODE";
const j = f.indexOf(tailMarker);
const i = f.indexOf(head);
if (i < 0 || j < 0) {
  console.error("markers missing", i, j);
  process.exit(1);
}
let inner = f.slice(i + head.length, j).trimEnd();
const m = inner.match(/\`;\s*$/);
if (!m) {
  console.error("expected template closer `;");
  process.exit(1);
}
inner = inner.slice(0, -m[0].length); // drop `; and trailing ws
const fenceOpen = "\\`\\`\\`java\r\n";
const fenceClose = "\r\n\\`\\`\\`";
const ph = "<<<FENCE>>>";
const fo = inner.indexOf(fenceOpen);
const fc = inner.indexOf(fenceClose, fo);
if (fo === -1 || fc === -1) {
  console.error("fence missing");
  process.exit(1);
}
const fenceBody = inner.slice(fo + fenceOpen.length, fc);
const withoutFence = inner.slice(0, fo) + ph + inner.slice(fc + fenceClose.length);
let fixed = withoutFence.replace(/\*\*`/g, "**").replace(/`\*\*/g, "**");
fixed = fixed.replace(/`/g, "");
fixed = fixed.replace(ph, fenceOpen + fenceBody + fenceClose);
const out = f.slice(0, i + head.length) + fixed + "`;" + f.slice(j);
fs.writeFileSync(path, out);
console.log("ok", fixed.length);
