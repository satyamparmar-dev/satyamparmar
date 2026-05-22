const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, '..', 'public', 'data', 'scenarioInterviewThemes.json');
const patchFile = process.argv[2] || 'scenario-patches.json';
const patchPath = path.join(__dirname, patchFile);

const main = JSON.parse(fs.readFileSync(mainPath, 'utf8'));
const patches = JSON.parse(fs.readFileSync(patchPath, 'utf8'));

let totalAdded = 0;
for (const [themeId, newScenarios] of Object.entries(patches)) {
  const theme = main.themes.find(t => t.id === themeId);
  if (!theme) {
    console.log(`WARNING: theme "${themeId}" not found — skipping`);
    continue;
  }
  const existingIds = new Set(theme.scenarios.map(s => s.id));
  let added = 0;
  for (const scenario of newScenarios) {
    if (!existingIds.has(scenario.id)) {
      theme.scenarios.push(scenario);
      added++;
      totalAdded++;
    } else {
      console.log(`  SKIP (duplicate id): ${scenario.id}`);
    }
  }
  console.log(`${themeId}: +${added} scenario(s) → total ${theme.scenarios.length}`);
}

fs.writeFileSync(mainPath, JSON.stringify(main, null, 2), 'utf8');
console.log(`\nDone. Added ${totalAdded} scenario(s) across ${Object.keys(patches).length} themes.`);
