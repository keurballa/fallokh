const fs = require('fs');

function replaceInFile(file, replacements) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    replacements.forEach(r => {
        content = content.replace(r.from, r.to);
    });
    if (original !== content) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
}

const docPath = 'c:/Users/samba lawbé/Downloads/fallokh-main/fallokh-main/src/views/Documents.tsx';
replaceInFile(docPath, [
    { from: /text-3xl font-black text-slate-900 uppercase tracking-widest/g, to: 'text-xl font-black text-slate-900 uppercase tracking-wide' },
    { from: /text-2xl font-black text-slate-900 uppercase tracking-widest/g, to: 'text-lg font-black text-slate-900 uppercase tracking-wide' }
]);

const evalPath = 'c:/Users/samba lawbé/Downloads/fallokh-main/fallokh-main/src/views/Evaluations.tsx';
replaceInFile(evalPath, [
    { from: /text-3xl font-black text-slate-900 uppercase tracking-widest/g, to: 'text-xl font-black text-slate-900 uppercase tracking-wide' }
]);

const tresPath = 'c:/Users/samba lawbé/Downloads/fallokh-main/fallokh-main/src/views/Tresorerie.tsx';
replaceInFile(tresPath, [
    { from: /text-2xl font-black text-slate-900 uppercase/g, to: 'text-lg font-black text-slate-900 uppercase' }
]);
