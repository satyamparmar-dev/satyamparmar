import fs from "fs";

const FILE = "public/data/days/phase2-day10.json";
const d = JSON.parse(fs.readFileSync(FILE, "utf8"));
const wordCount = (t) => (t || "").trim().split(/\s+/).filter(Boolean).length;
const paragraphCount = (t) => (t || "").split(/\n\s*\n/).filter((p) => p.trim()).length;
const h3Count = (t) => ((t || "").match(/^###\s+/gm) || []).length;
const iaCount = (t) => ((t || "").match(/\*\*Interview angle:\*\*/g) || []).length;
const scenarioCount = (t) => ((t || "").match(/--- Scenario \d+:/g) || []).length;
const blockCount = (t) => ((t || "").match(/=== Block \d+:/g) || []).length;
const codeLineCount = (c) =>
  (c || "").split("\n").filter((l) => {
    const x = l.trim();
    return x && !x.startsWith("//");
  }).length;
const tableCount = (text) => {
  const L = (text || "").split("\n");
  let n = 0;
  for (let i = 0; i < L.length - 1; i++) {
    if (/^\|/.test(L[i]) && /^\|?\s*[-:|\s]+\|?\s*$/.test(L[i + 1])) n++;
  }
  return n;
};
const cheatRows = (t) => Math.max(0, (t || "").split("\n").filter((l) => /^\|/.test(l)).length - 2);
const avgAns = (a) => (a.length ? Math.round(a.reduce((s, i) => s + wordCount(i.answer || ""), 0) / a.length) : 0);

const s = d.sections || [];
const bt = (type) => s.find((x) => x.type === type);
const codes = s.filter((x) => x.type === "code");
const why = bt("why");
const th = bt("theory");
const pit = bt("pitfalls");
const iv = bt("interview");
const mc = bt("mcq");
const ch = bt("cheatsheet");
const b = codes.find((x) => x.level === "basic");
const inter = codes.find((x) => x.level === "intermediate");
const adv = codes.find((x) => x.level === "advanced");
const q = mc.questions || [];

console.log(
  JSON.stringify(
    {
      FILE,
      title: d.title,
      whyW: wordCount(why.content),
      whyP: paragraphCount(why.content),
      h3: h3Count(th.content),
      tbl: tableCount(th.content),
      ia: iaCount(th.content),
      bL: codeLineCount(b.code),
      isc: scenarioCount(inter.code),
      iL: codeLineCount(inter.code),
      abl: blockCount(adv.code),
      aL: codeLineCount(adv.code),
      pit: pit.items.length,
      cc: iv.conceptual.length,
      cavg: avgAns(iv.conceptual),
      cbased: iv.codeBased.length,
      sr: iv.seniorScenario.length,
      savg: avgAns(iv.seniorScenario),
      wr: iv.wrongAnswers.length,
      job: !!iv.jobSwitch,
      mt: q.length,
      mb: q.filter((x) => x.level === "basic").length,
      mi: q.filter((x) => x.level === "intermediate").length,
      ma: q.filter((x) => x.level === "advanced").length,
      cr: cheatRows(ch.content),
    },
    null,
    2
  )
);
