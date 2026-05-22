const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, '..', 'public', 'data', 'scenarioInterviewThemes.json');
const newPath = path.join(__dirname, 'new-themes.json');

const main = JSON.parse(fs.readFileSync(mainPath, 'utf8'));
const newThemes = JSON.parse(fs.readFileSync(newPath, 'utf8'));

const existingIds = new Set(main.themes.map(t => t.id));
let added = 0;
for (const theme of newThemes) {
  if (!existingIds.has(theme.id)) {
    main.themes.push(theme);
    added++;
  }
}

fs.writeFileSync(mainPath, JSON.stringify(main, null, 2), 'utf8');
console.log(`Done. Added ${added} theme(s). Total: ${main.themes.length}`);
