const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('c:/Users/samba lawbé/Downloads/fallokh-main/fallokh-main/src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/Sama Daara Pro/g, 'Groupe Scolaire Fallokh Education de Mbour');
  content = content.replace(/Sama Daara/g, 'Groupe Scolaire Fallokh Education de Mbour');
  content = content.replace(/Sunu Daara Pro/g, 'Groupe Scolaire Fallokh Education de Mbour');
  content = content.replace(/Sunu Daara/g, 'Groupe Scolaire Fallokh Education de Mbour');
  fs.writeFileSync(file, content, 'utf8');
});
console.log('Replaced successfully!');
