const PAD_ROWS = [
  ["Operational metric", "Watch lag + ISR + request latency", "Say lag per partition and under-replicated partitions"],
  ["Failure drill", "Broker bounce + consumer crash chaos", "Prove rebalance and recovery SLOs in staging"],
  ["Capacity", "Partitions bound parallelism per group", "More consumers than partitions stay idle"],
  ["Security", "ACLs least privilege per principal", "Separate prod cluster or strict topic governance"],
  ["Cost", "Retention drives disk and replay cost", "Tiered storage or export before cutting retention"],
];

/** Convert legacy 2-column cheatsheet markdown into 15 triples for cheatsheetFromRows. */
export function cheatsheetRowsFromMarkdown(content) {
  const lines = String(content ?? "")
    .trim()
    .split("\n");
  const rows = [];
  for (const line of lines) {
    if (!line.startsWith("|")) continue;
    if (/^\|\s*---/.test(line)) continue;
    const cells = line
      .split("|")
      .map((s) => s.trim())
      .filter((c) => c.length > 0);
    if (cells.length >= 2 && cells[0] !== "Concept" && cells[0] !== "Topic") {
      const a = cells[0];
      const b = cells[1];
      const c = cells.length >= 3 ? cells[2] : b;
      rows.push([a, b, c]);
    }
  }
  let out = [...rows];
  let i = 0;
  while (out.length < 15) {
    out.push(PAD_ROWS[i % PAD_ROWS.length]);
    i += 1;
  }
  return out.slice(0, 15);
}
