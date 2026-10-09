const fs = require('fs');
const content = `1: import React, { useState, useEffect } from 'react';
2: import { FileText, Award, ClipboardList, UserCheck, Printer, Search } from 'lucide-react';
3: 
4: type DocTab = 'attestation' | 'certificat' | 'emargement' | 'renseignements';
5: 
6: const moisList = ['Octobre', 'Novembre', 'Décembre', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet'];
7: 
8: export default function Documents() {
9:   const [activeTab, setActiveTab] = useState<DocTab>('attestation');
10:   const [enseignants, setEnseignants] = useState<any[]>([]);
11:   const [eleves, setEleves] = useState<any[]>([]);
12:   const [classes, setClasses] = useState<any[]>([]);
13:   const [printDoc, setPrintDoc] = useState<any>(null);
14: 
15:   useEffect(() => {
16:     fetch('/api/tresorerie/enseignants').then(r => r.json()).then(setEnseignants).catch(console.error);
17:     fetch('/api/eleves').then(r => r.json()).then(data => setEleves(Array.isArray(data) ? data : [])).catch(console.error);
18:     fetch('/api/classes').then(r => r.json()).then(data => setClasses(Array.isArray(data) ? data : [])).catch(console.error);
19:   }, []);
20: 
21:   const tabs: { id: DocTab; label: string; icon: any }[] = [
22:     { id: 'attestation', label: 'Attestation Paiement', icon: FileText },
23:     { id: 'certificat', label: 'Certificat Scolarité', icon: Award },
24:     { id: 'emargement', label: "Fiche d'Émargement", icon: ClipboardList },
25:     { id: 'renseignements', label: 'Fiche Renseignements', icon: UserCheck },
26:   ];
27: 
28:   return (
29:     <div className="space-y-6">
30:       {/* Tabs */}
31:       <div className="glass-card p-4">
32:         <div className="flex flex-wrap gap-2">
33:           {tabs.map(tab => {
34:             const Icon = tab.icon;
35:             return (
36:               <button
37:                 key={tab.id}
38:                 onClick={() => { setActiveTab(tab.id); setPrintDoc(null); }}
39:                 className={\`px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 \${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}\`}
40:               >
41:                 <Icon size={16} /> {tab.label}
42:               </button>
43:             );
44:           })}
45:         </div>
46:       </div>
47: 
48:       {activeTab === 'attestation' && <AttestationPaiement enseignants={enseignants} printDoc={printDoc} setPrintDoc={setPrintDoc} />}
49:       {activeTab === 'certificat' && <CertificatScolarite eleves={eleves} classes={classes} printDoc={printDoc} setPrintDoc={setPrintDoc} />}
50:       {activeTab === 'emargement' && <FicheEmargement enseignants={enseignants} printDoc={printDoc} setPrintDoc={setPrintDoc} />}
51:       {activeTab === 'renseignements' && <FicheRenseignements eleves={eleves} classes={classes} printDoc={printDoc} setPrintDoc={setPrintDoc} />}
52:     </div>
53:   );
54: }
55: 
56: /* ============================================================
57:    1. ATTESTATION DE PAIEMENT
58:    ============================================================ */
59: function AttestationPaiement({ enseignants, printDoc, setPrintDoc }: any) {
60:   const [selectedEns, setSelectedEns] = useState('');
61:   const [selectedMois, setSelectedMois] = useState('Octobre');
62:   const [search, setSearch] = useState('');
63: 
64:   const filteredEns = enseignants.filter((e: any) =>
65:     \`\${e.prenom} \${e.nom}\`.toLowerCase().includes(search.toLowerCase())
66:   );
67: 
68:   const handleGenerate = () => {
69:     const ens = enseignants.find((e: any) => e.id.toString() === selectedEns);
70:     if (!ens) return;
71:     const paiement = ens.salaires?.[selectedMois];
72:     setPrintDoc({ enseignant: ens, mois: selectedMois, paiement });
73:   };
74: 
75:   const now = new Date();
76:   const annee = now.getMonth() >= 9 ? \`\${now.getFullYear()}-\${now.getFullYear()+1}\` : \`\${now.getFullYear()-1}-\${now.getFullYear()}\`;
77: 
78:   return (
79:     <div className="space-y-4">
80:       <div className="glass-card p-6">
81:         <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#818cf8' }}>📄 Générer une Attestation de Paiement</h3>
82:         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
83:           <div className="form-group mb-0">
84:             <label className="form-label">Enseignant</label>
85:             <div className="space-y-2">
86:               <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="form-input" />
87:               <select value={selectedEns} onChange={e => setSelectedEns(e.target.value)} className="form-input cursor-pointer" size={4} style={{ height: 'auto' }}>
88:                 {filteredEns.map((e: any) => (
89:                   <option key={e.id} value={e.id}>{e.prenom} {e.nom} — {e.specialite}</option>
90:                 ))}
91:               </select>
92:             </div>
93:           </div>
94:           <div className="form-group mb-0">
95:             <label className="form-label">Mois</label>
96:             <select value={selectedMois} onChange={e => setSelectedMois(e.target.value)} className="form-input cursor-pointer">
97:               {moisList.map(m => <option key={m} value={m}>{m}</option>)}
98:             </select>
99:           </div>
100:           <button onClick={handleGenerate} disabled={!selectedEns} className="btn-primary flex items-center gap-2">
101:             <FileText size={18} /> Générer l'Attestation
102:           </button>
103:         </div>
104:       </div>
105: 
106:       {/* Print Preview */}
107:       {printDoc && (
108:         <div className="fixed inset-0 z-[100] bg-black/80 flex justify-center items-start overflow-y-auto p-4 animate-fade-in print:p-0 print:bg-white print:absolute print:inset-0">
109:           <style>{\`
110:             @media print {
111:               body * { visibility: hidden; }
112:               #doc-print, #doc-print * { visibility: visible; }
113:               #doc-print { position: absolute; left: 0; top: 0; width: 100%; height: 296mm; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; margin: 0; padding: 20mm; }
114:               .no-print { display: none !important; }
115:               @page { size: A4 portrait; margin: 0; }
116:             }
117:           \`}</style>
118:           <div className="bg-white text-slate-900 max-w-2xl w-full rounded-2xl shadow-2xl relative my-8 print:shadow-none print:w-full print:max-w-none print:rounded-none print:my-0">
119:             <div className="flex justify-between items-center p-4 border-b border-gray-200 no-print bg-slate-50 rounded-t-2xl">
120:               <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Printer size={20} className="text-indigo-600" /> Attestation de Paiement</h3>
121:               <div className="flex gap-2">
122:                 <button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Printer size={18} /> Imprimer</button>
123:                 <button onClick={() => setPrintDoc(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-bold">Fermer</button>
124:               </div>
125:             </div>
126:             <div id="doc-print" className="p-10 bg-white flex flex-col min-h-screen print:min-h-[297mm]" style={{ fontFamily: 'serif' }}>
127:               {/* En-tête */}
128:               <div className="text-center mb-10 border-b-2 border-slate-900 pb-6">
129:                 <h1 className="text-xl font-black text-slate-900 uppercase tracking-wide">Groupe Scolaire Fallokh Education de Mbour</h1>
130:                 <p className="text-sm text-slate-600 font-semibold mt-1">Établissement d'Enseignement Privé</p>
131:                 <h2 className="text-xl font-bold text-slate-800 uppercase mt-4 underline decoration-2 underline-offset-4">Attestation de Paiement</h2>
132:                 <p className="text-sm text-slate-500 mt-2">Année Scolaire {annee}</p>
133:               </div>
134: 
135:               {/* Corps */}
136:               <div className="text-lg print:text-xl leading-loose text-slate-800 mb-10 flex-1 flex flex-col justify-around">
137:                 <p className="mb-6">
138:                   Je soussigné(e), <strong>Directeur/Directrice</strong> de l'établissement <strong>Groupe Scolaire Fallokh Education de Mbour</strong>,
139:                   atteste par la présente que :
140:                 </p>
141: 
142:                 <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-6">
143:                   <table className="w-full text-base print:text-lg">
144:                     <tbody>
145:                       <tr><td className="py-2 text-slate-500 font-semibold w-44">Nom & Prénom :</td><td className="py-2 font-bold text-slate-900">{printDoc.enseignant.prenom} {printDoc.enseignant.nom}</td></tr>
146:                       <tr><td className="py-2 text-slate-500 font-semibold">Matricule :</td><td className="py-2 font-mono">{printDoc.enseignant.matricule}</td></tr>
147:                       <tr><td className="py-2 text-slate-500 font-semibold">Spécialité :</td><td className="py-2">{printDoc.enseignant.specialite}</td></tr>
148:                       <tr><td className="py-2 text-slate-500 font-semibold">Mode de paiement :</td><td className="py-2">{printDoc.enseignant.mode_paiement === 'horaire' ? 'Vacataire (à l\\'heure)' : 'Mensuel'}</td></tr>
149:                     </tbody>
150:                   </table>
151:                 </div>
152: 
153:                 {printDoc.paiement ? (
154:                   <div>
155:                     <p className="mb-4">
156:                       a bien perçu son salaire pour le mois de <strong>{printDoc.mois}</strong>, dont les détails sont les suivants :
157:                     </p>
158:                     <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-200 mb-6">
159:                       <table className="w-full text-base print:text-lg">
160:                         <tbody>
161:                           <tr><td className="py-2 text-slate-500 font-semibold w-44">Mois :</td><td className="py-2 font-bold">{printDoc.mois}</td></tr>
162:                           <tr><td className="py-2 text-slate-500 font-semibold">Heures effectuées :</td><td className="py-2 font-bold text-indigo-700">{printDoc.paiement.heures || 0} heures</td></tr>
163:                           {printDoc.enseignant.mode_paiement === 'horaire' ? (
164:                             <tr><td className="py-2 text-slate-500 font-semibold">Taux horaire :</td><td className="py-2">{(printDoc.enseignant.taux_horaire || 1500).toLocaleString()} FCFA/h</td></tr>
165:                           ) : (
166:                             <tr><td className="py-2 text-slate-500 font-semibold">Salaire mensuel :</td><td className="py-2">{(printDoc.paiement.montant).toLocaleString()} FCFA</td></tr>
167:                           )}
168:                           <tr><td className="py-2 text-slate-500 font-semibold">Montant perçu :</td><td className="py-2 font-black text-lg text-slate-900">{printDoc.paiement.montant.toLocaleString()} FCFA</td></tr>
169:                           <tr><td className="py-2 text-slate-500 font-semibold">Date du paiement :</td><td className="py-2">{new Date(printDoc.paiement.date_paiement).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
170:                         </tbody>
171:                       </table>
172:                     </div>
173:                   </div>
174:                 ) : (
175:                   <p className="mb-6 text-rose-600 font-bold p-4 bg-rose-50 rounded-xl border border-rose-200">
176:                     ⚠️ Aucun paiement enregistré pour le mois de {printDoc.mois}. L'attestation ne peut certifier un paiement non effectué.
177:                   </p>
178:                 )}
179: 
180:                 <p>
181:                   Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.
182:                 </p>
183: 
184:                 <p className="mt-4 text-sm text-slate-500">
185:                   Fait à ____________, le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
186:                 </p>
187:               </div>
188: 
189:               {/* Émargement */}
190:               <div className="mt-auto pt-10 flex justify-between">
191:                 <div className="text-center">
192:                   <p className="text-sm font-bold text-slate-900 mb-20">L'Agent</p>
193:                   <div className="border-b-2 border-dotted border-slate-400 w-56 mx-auto"></div>
194:                   <p className="text-xs text-slate-500 mt-2">Signature</p>
195:                 </div>
196:                 <div className="text-center">
197:                   <p className="text-sm font-bold text-slate-900 mb-20">Le Directeur</p>
198:                   <div className="border-b-2 border-dotted border-slate-400 w-56 mx-auto"></div>
199:                   <p className="text-xs text-slate-500 mt-2">Signature & Cachet</p>
200:                 </div>
201:               </div>
202:             </div>
203:           </div>
204:         </div>
205:       )}
206:     </div>
207:   );
208: }
209: 
210: /* ============================================================
211:    2. CERTIFICAT DE SCOLARITÉ
212:    ============================================================ */
213: function CertificatScolarite({ eleves, classes, printDoc, setPrintDoc }: any) {
214:   const [selectedEleve, setSelectedEleve] = useState('');
215:   const [search, setSearch] = useState('');
216: 
217:   const filteredEleves = eleves.filter((e: any) =>
218:     \`\${e.prenom} \${e.nom} \${e.matricule}\`.toLowerCase().includes(search.toLowerCase()) && e.statut === 'Actif'
219:   );
220: 
221:   const handleGenerate = () => {
222:     const el = eleves.find((e: any) => e.id.toString() === selectedEleve);
223:     if (!el) return;
224:     const classe = classes.find((c: any) => c.id === el.classe_id);
225:     setPrintDoc({ eleve: el, classe });
226:   };
227: 
228:   const now = new Date();
229:   const annee = now.getMonth() >= 9 ? \`\${now.getFullYear()}-\${now.getFullYear()+1}\` : \`\${now.getFullYear()-1}-\${now.getFullYear()}\`;
230: 
231:   return (
232:     <div className="space-y-4">
233:       <div className="glass-card p-6">
234:         <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#34d399' }}>🎓 Générer un Certificat de Scolarité</h3>
235:         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
236:           <div className="form-group mb-0">
237:             <label className="form-label">Élève (Actifs uniquement)</label>
238:             <input type="text" placeholder="Rechercher par nom ou matricule..." value={search} onChange={e => setSearch(e.target.value)} className="form-input mb-2" />
239:             <select value={selectedEleve} onChange={e => setSelectedEleve(e.target.value)} className="form-input cursor-pointer" size={5} style={{ height: 'auto' }}>
240:               {filteredEleves.map((e: any) => (
241:                 <option key={e.id} value={e.id}>{e.prenom} {e.nom} — {e.matricule} ({e.classe_nom || 'N/A'})</option>
242:               ))}
243:             </select>
244:           </div>
245:           <button onClick={handleGenerate} disabled={!selectedEleve} className="btn-primary flex items-center gap-2 self-end">
246:             <Award size={18} /> Générer le Certificat
247:           </button>
248:         </div>
249:       </div>
250: 
251:       {printDoc && (
252:         <div className="fixed inset-0 z-[100] bg-black/80 flex justify-center items-start overflow-y-auto p-4 animate-fade-in print:p-0 print:bg-white print:absolute print:inset-0">
253:           <style>{\`
254:             @media print {
255:               body * { visibility: hidden; }
256:               #doc-print, #doc-print * { visibility: visible; }
257:               #doc-print { position: absolute; left: 0; top: 0; width: 100%; height: 296mm; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; margin: 0; padding: 20mm; }
258:               .no-print { display: none !important; }
259:               @page { size: A4 portrait; margin: 0; }
260:             }
261:           \`}</style>
262:           <div className="bg-white text-slate-900 max-w-2xl w-full rounded-2xl shadow-2xl relative my-8 print:shadow-none print:w-full print:max-w-none print:rounded-none print:my-0">
263:             <div className="flex justify-between items-center p-4 border-b border-gray-200 no-print bg-slate-50 rounded-t-2xl">
264:               <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Award size={20} className="text-emerald-600" /> Certificat de Scolarité</h3>
265:               <div className="flex gap-2">
266:                 <button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Printer size={18} /> Imprimer</button>
267:                 <button onClick={() => setPrintDoc(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-bold">Fermer</button>
268:               </div>
269:             </div>
270:             <div id="doc-print" className="p-10 bg-white flex flex-col min-h-screen print:min-h-[297mm]" style={{ fontFamily: 'serif' }}>
271:               <div className="text-center mb-10 border-b-2 border-slate-900 pb-6">
272:                 <h1 className="text-xl font-black text-slate-900 uppercase tracking-wide">Groupe Scolaire Fallokh Education de Mbour</h1>
273:                 <p className="text-sm text-slate-600 font-semibold mt-1">Établissement d'Enseignement Privé</p>
274:                 <h2 className="text-xl font-bold text-slate-800 uppercase mt-4 underline decoration-2 underline-offset-4">Certificat de Scolarité</h2>
275:                 <p className="text-sm text-slate-500 mt-2">Année Scolaire {annee}</p>
276:               </div>
277: 
278:               <div className="text-lg print:text-xl leading-loose text-slate-800 mb-10 flex-1 flex flex-col justify-around">
279:                 <p className="mb-6">
280:                   Je soussigné(e), <strong>Directeur/Directrice</strong> de l'établissement <strong>Groupe Scolaire Fallokh Education de Mbour</strong>,
281:                   certifie que :
282:                 </p>
283: 
284:                 <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-6">
285:                   <table className="w-full text-base print:text-lg">
286:                     <tbody>
287:                       <tr><td className="py-2 text-slate-500 font-semibold w-52">Nom & Prénom :</td><td className="py-2 font-bold text-slate-900 text-lg">{printDoc.eleve.prenom} {printDoc.eleve.nom}</td></tr>
288:                       <tr><td className="py-2 text-slate-500 font-semibold">Matricule :</td><td className="py-2 font-mono">{printDoc.eleve.matricule}</td></tr>
289:                       <tr><td className="py-2 text-slate-500 font-semibold">Date de Naissance :</td><td className="py-2">{printDoc.eleve.date_naissance ? new Date(printDoc.eleve.date_naissance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non renseignée'}</td></tr>
290:                       <tr><td className="py-2 text-slate-500 font-semibold">Lieu de Naissance :</td><td className="py-2">{printDoc.eleve.lieu_naissance || 'Non renseigné'}</td></tr>
291:                       <tr><td className="py-2 text-slate-500 font-semibold">Classe :</td><td className="py-2 font-bold">{printDoc.classe?.nom || printDoc.eleve.classe_nom || 'Non assignée'}</td></tr>
292:                       <tr><td className="py-2 text-slate-500 font-semibold">Cycle :</td><td className="py-2">{printDoc.classe?.cycle || 'N/A'}</td></tr>
293:                     </tbody>
294:                   </table>
295:                 </div>
296: 
297:                 <p className="mb-4">
298:                   est régulièrement inscrit(e) dans notre établissement pour l'année scolaire <strong>{annee}</strong> et fréquente assidûment les cours.
299:                 </p>
300: 
301:                 <p>
302:                   En foi de quoi, le présent certificat est délivré à l'intéressé(e) pour servir et valoir ce que de droit.
303:                 </p>
304: 
305:                 <p className="mt-4 text-sm text-slate-500">
306:                   Fait à ____________, le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
307:                 </p>
308:               </div>
309: 
310:               <div className="mt-auto pt-10 text-right">
311:                 <p className="text-sm font-bold text-slate-900 mb-20">Le Directeur / La Directrice</p>
312:                 <div className="border-b-2 border-dotted border-slate-400 w-56 ml-auto"></div>
313:                 <p className="text-xs text-slate-500 mt-2">Signature & Cachet</p>
314:               </div>
315:             </div>
316:           </div>
317:         </div>
318:       )}
319:     </div>
320:   );
321: }
322: 
323: /* ============================================================
324:    3. FICHE D'ÉMARGEMENT
325:    ============================================================ */
326: function FicheEmargement({ enseignants, printDoc, setPrintDoc }: any) {
327:   const [selectedMois, setSelectedMois] = useState('Octobre');
328: 
329:   const handleGenerate = () => {
330:     // Calculate working days for the month
331:     const now = new Date();
332:     const year = now.getFullYear();
333:     const moisIndex: Record<string, number> = {
334:       'Octobre': 9, 'Novembre': 10, 'Décembre': 11, 'Janvier': 0,
335:       'Février': 1, 'Mars': 2, 'Avril': 3, 'Mai': 4, 'Juin': 5, 'Juillet': 6
336:     };
337:     const monthNum = moisIndex[selectedMois];
338:     const actualYear = monthNum >= 9 ? year : year + 1;
339:     const daysInMonth = new Date(actualYear, monthNum + 1, 0).getDate();
340:     const workingDays: number[] = [];
341:     for (let d = 1; d <= daysInMonth; d++) {
342:       const day = new Date(actualYear, monthNum, d).getDay();
343:       if (day !== 0) workingDays.push(d); // Exclude Sunday
344:     }
345:     setPrintDoc({ mois: selectedMois, workingDays, enseignants: enseignants.filter((e: any) => e.statut === 'Actif') });
346:   };
347: 
348:   const now = new Date();
349:   const annee = now.getMonth() >= 9 ? \`\${now.getFullYear()}-\${now.getFullYear()+1}\` : \`\${now.getFullYear()-1}-\${now.getFullYear()}\`;
350: 
351:   return (
352:     <div className="space-y-4">
353:       <div className="glass-card p-6">
354:         <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#fbbf24' }}>📋 Générer la Fiche d'Émargement</h3>
355:         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
356:           <div className="form-group mb-0">
357:             <label className="form-label">Mois</label>
358:             <select value={selectedMois} onChange={e => setSelectedMois(e.target.value)} className="form-input cursor-pointer">
359:               {moisList.map(m => <option key={m} value={m}>{m}</option>)}
360:             </select>
361:           </div>
362:           <button onClick={handleGenerate} className="btn-primary flex items-center gap-2">
363:             <ClipboardList size={18} /> Générer la Fiche
364:           </button>
365:         </div>
366:       </div>
367: 
368:       {printDoc && (
369:         <div className="fixed inset-0 z-[100] bg-black/80 flex justify-center items-start overflow-y-auto p-4 animate-fade-in print:p-0 print:bg-white print:absolute print:inset-0">
370:           <style>{\`
371:             @media print {
372:               body * { visibility: hidden; }
373:               #doc-print, #doc-print * { visibility: visible; }
374:               #doc-print { position: absolute; left: 0; top: 0; width: 100%; height: 209mm; display: flex; flex-direction: column; box-sizing: border-box; margin: 0; padding: 15mm; font-size: 9px; }
375:               .no-print { display: none !important; }
376:               @page { size: A4 landscape; margin: 0; }
377:             }
378:           \`}</style>
379:           <div className="bg-white text-slate-900 max-w-[95vw] w-full rounded-2xl shadow-2xl relative my-8 print:shadow-none print:w-full print:max-w-none print:rounded-none print:my-0">
380:             <div className="flex justify-between items-center p-4 border-b border-gray-200 no-print bg-slate-50 rounded-t-2xl">
381:               <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><ClipboardList size={20} className="text-amber-600" /> Fiche d'Émargement — {printDoc.mois}</h3>
382:               <div className="flex gap-2">
383:                 <button onClick={() => window.print()} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Printer size={18} /> Imprimer</button>
384:                 <button onClick={() => setPrintDoc(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-bold">Fermer</button>
385:               </div>
386:             </div>
387:             <div id="doc-print" className="p-6 bg-white overflow-x-auto flex flex-col min-h-screen print:min-h-[210mm]">
388:               <div className="text-center mb-6 border-b-2 border-slate-900 pb-4">
389:                 <h1 className="text-xl font-black text-slate-900 uppercase tracking-wide">Groupe Scolaire Fallokh Education de Mbour</h1>
390:                 <h2 className="text-lg font-bold text-slate-700 uppercase mt-1">Fiche d'Émargement — {printDoc.mois}</h2>
391:                 <p className="text-xs font-semibold text-slate-500 mt-1">Année Scolaire {annee}</p>
392:               </div>
393: 
394:               <table className="w-full text-xs border-collapse">
395:                 <thead>
396:                   <tr className="bg-slate-800 text-white">
397:                     <th className="py-2 px-2 border border-slate-700 text-left sticky left-0 bg-slate-800 z-10" style={{ minWidth: '40px' }}>N°</th>
398:                     <th className="py-2 px-2 border border-slate-700 text-left sticky left-10 bg-slate-800 z-10" style={{ minWidth: '160px' }}>Nom & Prénom</th>
399:                     {printDoc.workingDays.map((d: number) => (
400:                       <th key={d} className="py-2 px-1 border border-slate-700 text-center" style={{ minWidth: '28px' }}>{d}</th>
401:                     ))}
402:                     <th className="py-2 px-2 border border-slate-700 text-center" style={{ minWidth: '50px' }}>Total</th>
403:                   </tr>
404:                 </thead>
405:                 <tbody>
406:                   {printDoc.enseignants.map((ens: any, idx: number) => (
407:                     <tr key={ens.id} className="border-b border-slate-200">
408:                       <td className="py-3 px-2 border border-slate-200 text-center font-bold text-slate-500">{idx + 1}</td>
409:                       <td className="py-3 px-2 border border-slate-200 font-semibold text-slate-900 whitespace-nowrap">{ens.prenom} {ens.nom}</td>
410:                       {printDoc.workingDays.map((d: number) => (
411:                         <td key={d} className="py-3 px-1 border border-slate-200 text-center"></td>
412:                       ))}
413:                       <td className="py-3 px-2 border border-slate-200 text-center"></td>
414:                     </tr>
415:                   ))}
416:                 </tbody>
417:               </table>
418: 
419:               <div className="mt-auto pt-10 flex justify-between">
420:                 <div className="text-center">
421:                   <p className="text-sm font-bold text-slate-900 mb-16">Le Responsable Pédagogique</p>
422:                   <div className="border-b-2 border-dotted border-slate-400 w-48"></div>
423:                 </div>
424:                 <div className="text-center">
425:                   <p className="text-sm font-bold text-slate-900 mb-16">Le Directeur / La Directrice</p>
426:                   <div className="border-b-2 border-dotted border-slate-400 w-48"></div>
427:                 </div>
428:               </div>
429:             </div>
430:           </div>
431:         </div>
432:       )}
433:     </div>
434:   );
435: }
436: 
437: /* ============================================================
438:    4. FICHE DE RENSEIGNEMENTS
439:    ============================================================ */
440: function FicheRenseignements({ eleves, classes, printDoc, setPrintDoc }: any) {
441:   const [selectedEleve, setSelectedEleve] = useState('');
442:   const [search, setSearch] = useState('');
443: 
444:   const filteredEleves = eleves.filter((e: any) =>
445:     \`\${e.prenom} \${e.nom} \${e.matricule}\`.toLowerCase().includes(search.toLowerCase())
446:   );
447: 
448:   const handleGenerate = () => {
449:     const el = eleves.find((e: any) => e.id.toString() === selectedEleve);
450:     if (!el) return;
451:     const classe = classes.find((c: any) => c.id === el.classe_id);
452:     setPrintDoc({ eleve: el, classe });
453:   };
454: 
455:   const now = new Date();
456:   const annee = now.getMonth() >= 9 ? \`\${now.getFullYear()}-\${now.getFullYear()+1}\` : \`\${now.getFullYear()-1}-\${now.getFullYear()}\`;
457: 
458:   return (
459:     <div className="space-y-4">
460:       <div className="glass-card p-6">
461:         <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#f472b6' }}>📝 Générer une Fiche de Renseignements</h3>
462:         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
463:           <div className="form-group mb-0">
464:             <label className="form-label">Élève</label>
465:             <input type="text" placeholder="Rechercher par nom ou matricule..." value={search} onChange={e => setSearch(e.target.value)} className="form-input mb-2" />
466:             <select value={selectedEleve} onChange={e => setSelectedEleve(e.target.value)} className="form-input cursor-pointer" size={5} style={{ height: 'auto' }}>
467:               {filteredEleves.map((e: any) => (
468:                 <option key={e.id} value={e.id}>{e.prenom} {e.nom} — {e.matricule} ({e.classe_nom || 'N/A'})</option>
469:               ))}
470:             </select>
471:           </div>
472:           <button onClick={handleGenerate} disabled={!selectedEleve} className="btn-primary flex items-center gap-2 self-end">
473:             <UserCheck size={18} /> Générer la Fiche
474:           </button>
475:         </div>
476:       </div>
477: 
478:       {printDoc && (
479:         <div className="fixed inset-0 z-[100] bg-black/80 flex justify-center items-start overflow-y-auto p-4 animate-fade-in print:p-0 print:bg-white print:absolute print:inset-0">
480:           <style>{\`
481:             @media print {
482:               body * { visibility: hidden; }
483:               #doc-print, #doc-print * { visibility: visible; }
484:               #doc-print { position: absolute; left: 0; top: 0; width: 100%; height: 296mm; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; margin: 0; padding: 20mm; }
485:               .no-print { display: none !important; }
486:               @page { size: A4 portrait; margin: 0; }
487:             }
488:           \`}</style>
489:           <div className="bg-white text-slate-900 max-w-2xl w-full rounded-2xl shadow-2xl relative my-8 print:shadow-none print:w-full print:max-w-none print:rounded-none print:my-0">
490:             <div className="flex justify-between items-center p-4 border-b border-gray-200 no-print bg-slate-50 rounded-t-2xl">
491:               <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><UserCheck size={20} className="text-pink-600" /> Fiche de Renseignements</h3>
492:               <div className="flex gap-2">
493:                 <button onClick={() => window.print()} className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Printer size={18} /> Imprimer</button>
494:                 <button onClick={() => setPrintDoc(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-bold">Fermer</button>
495:               </div>
496:             </div>
497:             <div id="doc-print" className="p-10 bg-white flex flex-col min-h-screen print:min-h-[297mm]" style={{ fontFamily: 'serif' }}>
498:               <div className="text-center mb-10 border-b-2 border-slate-900 pb-6">
499:                 <h1 className="text-xl font-black text-slate-900 uppercase tracking-wide">Groupe Scolaire Fallokh Education de Mbour</h1>
500:                 <p className="text-sm text-slate-600 font-semibold mt-1">Établissement d'Enseignement Privé</p>
501:                 <h2 className="text-xl font-bold text-slate-800 uppercase mt-4 underline decoration-2 underline-offset-4">Fiche de Renseignements</h2>
502:                 <p className="text-sm text-slate-500 mt-2">Année Scolaire {annee}</p>
503:               </div>
504:               
505:               <div className="flex-1 flex flex-col justify-around">
506:                 {/* Infos Élève */}
507:                 <h3 className="text-base font-black text-slate-900 uppercase tracking-wider border-l-4 border-indigo-600 pl-3 mb-4">Identité de l'Élève</h3>
508:                 <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-8">
509:                   <table className="w-full text-base print:text-lg">
510:                     <tbody>
511:                       <tr><td className="py-2.5 text-slate-500 font-semibold w-52">Nom :</td><td className="py-2.5 font-bold text-slate-900 text-lg">{printDoc.eleve.nom}</td></tr>
512:                       <tr><td className="py-2.5 text-slate-500 font-semibold">Prénom :</td><td className="py-2.5 font-bold text-slate-900 text-lg">{printDoc.eleve.prenom}</td></tr>
513:                       <tr><td className="py-2.5 text-slate-500 font-semibold">Matricule :</td><td className="py-2.5 font-mono">{printDoc.eleve.matricule}</td></tr>
514:                       <tr><td className="py-2.5 text-slate-500 font-semibold">Date de Naissance :</td><td className="py-2.5">{printDoc.eleve.date_naissance ? new Date(printDoc.eleve.date_naissance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '____________________________'}</td></tr>
515:                       <tr><td className="py-2.5 text-slate-500 font-semibold">Lieu de Naissance :</td><td className="py-2.5">{printDoc.eleve.lieu_naissance || '____________________________'}</td></tr>
516:                       <tr><td className="py-2.5 text-slate-500 font-semibold">Classe :</td><td className="py-2.5 font-bold">{printDoc.classe?.nom || printDoc.eleve.classe_nom || '____________________________'}</td></tr>
517:                       <tr><td className="py-2.5 text-slate-500 font-semibold">Cycle :</td><td className="py-2.5">{printDoc.classe?.cycle || 'N/A'}</td></tr>
518:                       <tr><td className="py-2.5 text-slate-500 font-semibold">Statut :</td><td className="py-2.5">{printDoc.eleve.statut}</td></tr>
519:                       <tr><td className="py-2.5 text-slate-500 font-semibold">Redoublant :</td><td className="py-2.5 font-bold" style={{ color: printDoc.eleve.redoublant === 'Oui' ? '#dc2626' : '#16a34a' }}>{printDoc.eleve.redoublant || 'Non'}</td></tr>
520:                     </tbody>
521:                   </table>
522:                 </div>
523: 
524:                 {/* Infos Tuteur */}
525:                 <h3 className="text-base font-black text-slate-900 uppercase tracking-wider border-l-4 border-emerald-600 pl-3 mb-4">Informations du Tuteur / Parents</h3>
526:                 <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200 mb-8">
527:                   <table className="w-full text-base print:text-lg">
528:                     <tbody>
529:                       <tr><td className="py-2.5 text-slate-500 font-semibold w-52">Nom du Père :</td><td className="py-2.5 font-bold">{printDoc.eleve.nom_pere || '____________________________'}</td></tr>
530:                       <tr><td className="py-2.5 text-slate-500 font-semibold">Nom de la Mère :</td><td className="py-2.5 font-bold">{printDoc.eleve.nom_mere || '____________________________'}</td></tr>
531:                       <tr><td className="py-2.5 text-slate-500 font-semibold">Adresse :</td><td className="py-2.5">{printDoc.eleve.adresse || '____________________________'}</td></tr>
532:                       <tr><td className="py-2.5 text-slate-500 font-semibold">Téléphone Tuteur :</td><td className="py-2.5 font-mono">{printDoc.eleve.telephone_tuteur || '____________________________'}</td></tr>
533:                     </tbody>
534:                   </table>
535:                 </div>
536: 
537:                 {/* Observations */}
538:                 <h3 className="text-base font-black text-slate-900 uppercase tracking-wider border-l-4 border-amber-500 pl-3 mb-4">Observations</h3>
539:                 <div className="border-2 border-slate-200 rounded-xl p-6 mb-8" style={{ minHeight: '100px' }}>
540:                   <div className="border-b border-dotted border-slate-300 py-4"></div>
541:                   <div className="border-b border-dotted border-slate-300 py-4"></div>
542:                   <div className="border-b border-dotted border-slate-300 py-4"></div>
543:                 </div>
544:               </div>
545: 
546:               {/* Émargement */}
547:               <div className="mt-auto pt-10 flex justify-between">
548:                 <div className="text-center">
549:                   <p className="text-sm font-bold text-slate-900 mb-16">Le Tuteur</p>
550:                   <div className="border-b-2 border-dotted border-slate-400 w-48"></div>
551:                   <p className="text-xs text-slate-500 mt-2">Signature</p>
552:                 </div>
553:                 <div className="text-center">
554:                   <p className="text-sm font-bold text-slate-900 mb-16">Le Directeur / La Directrice</p>
555:                   <div className="border-b-2 border-dotted border-slate-400 w-48"></div>
556:                   <p className="text-xs text-slate-500 mt-2">Signature & Cachet</p>
557:                 </div>
558:               </div>
559:             </div>
560:           </div>
561:         </div>
562:       )}
563:     </div>
564:   );
565: }
`;

const cleanedContent = content.split('\n').map(line => {
  const match = line.match(/^\d+:\s(.*)/);
  if (match) {
    return match[1];
  }
  return line;
}).join('\n');

fs.writeFileSync('c:/Users/samba lawbé/Downloads/fallokh-main/fallokh-main/src/views/Documents.tsx', cleanedContent, 'utf8');
console.log('Restored Documents.tsx completely');
