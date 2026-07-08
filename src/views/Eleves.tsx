import React, { useEffect, useState } from 'react';
import { Search, Plus, MoreVertical, GraduationCap } from 'lucide-react';

interface Eleve {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  niveau: string;
  statut: string;
  classe_nom?: string;
}

export default function Eleves() {
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/eleves')
      .then(r => r.json())
      .then(data => {
        setEleves(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setEleves([]);
        setLoading(false);
      });
  }, []);

  const filtered = eleves.filter(e => 
    e.nom.toLowerCase().includes(search.toLowerCase()) || 
    e.prenom.toLowerCase().includes(search.toLowerCase()) ||
    e.matricule.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un matricule, nom..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm"
          />
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-semibold shadow-sm">
          <Plus size={18} />
          Nouvel Élève
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="border-b border-slate-100">
                <th className="py-3 px-5 font-semibold">Matricule</th>
                <th className="py-3 px-5 font-semibold">Élève (Nom & Prénom)</th>
                <th className="py-3 px-5 font-semibold">Classe</th>
                <th className="py-3 px-5 font-semibold">Statut</th>
                <th className="py-3 px-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">Chargement des données...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <GraduationCap size={40} className="text-slate-300" />
                      <p>Aucun élève ne correspond à votre recherche.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(eleve => (
                  <tr key={eleve.id} className="border-b border-slate-100 even:bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-5 font-medium">{eleve.matricule}</td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-[10px] font-bold">
                          {eleve.prenom[0]}{eleve.nom[0]}
                        </div>
                        <span className="font-medium">{eleve.prenom} {eleve.nom}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase">
                        {eleve.classe_nom || eleve.niveau || 'Non assignée'}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">
                        {eleve.statut}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-blue-50 opacity-0 group-hover:opacity-100">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
