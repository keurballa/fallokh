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
    { 
      from: /<div className="text-base leading-relaxed text-slate-800 mb-10 flex-1">/g, 
      to: '<div className="text-lg print:text-xl leading-loose text-slate-800 mb-10 flex-1 flex flex-col justify-around">' 
    },
    {
      from: /<table className="w-full text-sm">/g,
      to: '<table className="w-full text-base print:text-lg">'
    }
]);

const evalPath = 'c:/Users/samba lawbé/Downloads/fallokh-main/fallokh-main/src/views/Evaluations.tsx';
replaceInFile(evalPath, [
    { 
      from: /<table className="w-full text-left border-collapse mb-8">/g, 
      to: '<table className="w-full text-left border-collapse mb-8 flex-1">' 
    },
    {
      from: /<td className="py-3 px-4/g,
      to: '<td className="py-4 px-4'
    }
]);

const tresPath = 'c:/Users/samba lawbé/Downloads/fallokh-main/fallokh-main/src/views/Tresorerie.tsx';
replaceInFile(tresPath, [
    { 
      from: /<div className="space-y-4 text-lg border-y-2 border-dashed border-slate-300 py-6 my-6">/g, 
      to: '<div className="space-y-4 text-xl print:text-2xl border-y-2 border-dashed border-slate-300 py-6 my-6 flex-1 flex flex-col justify-evenly">' 
    }
]);
