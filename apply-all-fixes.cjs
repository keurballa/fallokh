const fs = require('fs');
let file = 'c:/Users/samba lawbé/Downloads/fallokh-main/fallokh-main/src/views/Documents.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Font fixes
content = content.replace(/text-3xl font-black text-slate-900 uppercase tracking-widest/g, 'text-xl font-black text-slate-900 uppercase tracking-wide');
content = content.replace(/text-2xl font-black text-slate-900 uppercase tracking-widest/g, 'text-lg font-black text-slate-900 uppercase tracking-wide');
content = content.replace(/Sunu Daara/g, 'Groupe Scolaire Fallokh Education de Mbour');
content = content.replace(/Sama Daara/g, 'Groupe Scolaire Fallokh Education de Mbour');

// 2. Spacing for Attestation & Certificat
content = content.replace(
  /<div className="text-base leading-relaxed text-slate-800 mb-10 flex-1">/g,
  '<div className="text-lg print:text-xl leading-loose text-slate-800 mb-10 flex-1 flex flex-col justify-around">'
);
content = content.replace(
  /<table className="w-full text-sm">/g,
  '<table className="w-full text-base print:text-lg">'
);

// 3. Spacing for Fiche de Renseignements
// Wrap the content of FicheRenseignements in a flex container
const parts = content.split('/* Infos Élève */');
if (parts.length > 1) {
  content = parts[0] + '/* Infos Élève */\n<div className="flex-1 flex flex-col justify-around">\n' + parts[1];
  // find Emargement inside FicheRenseignements
  const parts2 = content.split('/* Observations */');
  if (parts2.length > 1) {
     const subParts = parts2[1].split('/* Émargement */');
     if (subParts.length > 1) {
        content = parts2[0] + '/* Observations */' + subParts[0] + '</div>\n{/* Émargement */}' + subParts[1];
     }
  }
}

// 4. Attestation details: Heures & Salaire mensuel
content = content.replace(
  /{printDoc\.paiement\.heures > 0 && \([\s\S]*?Heures effectuées :[\s\S]*?heures<\/td><\/tr>\s*\)}/,
  '<tr><td className="py-2 text-slate-500 font-semibold">Heures effectuées :</td><td className="py-2 font-bold text-indigo-700">{printDoc.paiement.heures || 0} heures</td></tr>'
);

content = content.replace(
  /{printDoc\.enseignant\.mode_paiement === 'horaire' && \([\s\S]*?Taux horaire :[\s\S]*?FCFA\/h<\/td><\/tr>\s*\)}/,
  `{printDoc.enseignant.mode_paiement === 'horaire' ? (
                            <tr><td className="py-2 text-slate-500 font-semibold">Taux horaire :</td><td className="py-2">{(printDoc.enseignant.taux_horaire || 1500).toLocaleString()} FCFA/h</td></tr>
                          ) : (
                            <tr><td className="py-2 text-slate-500 font-semibold">Salaire mensuel :</td><td className="py-2">{(printDoc.paiement.montant).toLocaleString()} FCFA</td></tr>
                          )}`
);

// 5. Attestation Signatures (First instance of L'Enseignant(e) and Le Directeur / La Directrice is in Attestation)
content = content.replace("L'Enseignant(e)", "L'Agent");
content = content.replace("Le Directeur / La Directrice", "Le Directeur");

// Write back
fs.writeFileSync(file, content, 'utf8');
console.log('Applied all document fixes properly.');
