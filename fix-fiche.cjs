const fs = require('fs');
let file = 'c:/Users/samba lawbé/Downloads/fallokh-main/fallokh-main/src/views/Documents.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix FicheRenseignements to take up full page
content = content.replace(
  /<table className="w-full text-sm">/g, 
  '<table className="w-full text-base print:text-lg">'
);

// Specifically for FicheRenseignements body wrappers to flex
// It starts with {/* Infos Élève */}
content = content.replace(
  /{[\s\S]*?Infos Élève[\s\S]*?}/, 
  `{/* Infos Élève */}
              <div className="flex-1 flex flex-col justify-around">`
);

// We need to close the div before the signature block
content = content.replace(
  /{[\s\S]*?Émargement[\s\S]*?}/,
  `</div>\n              {/* Émargement */}`
);

// Also fix encoding issues caused by terminal mismatches
content = content.replace(/Heures effectuǸes/g, 'Heures effectuées');
content = content.replace(/Montant peru/g, 'Montant perçu');
content = content.replace(/Montant peru/g, 'Montant perçu');
content = content.replace(/GǸnǸrer/g, 'Générer');
content = content.replace(/Non assignǸe/g, 'Non assignée');
content = content.replace(/%lve/g, 'Élève');
content = content.replace(/%margement/g, 'Émargement');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Fiche Renseignements and Encodings');
