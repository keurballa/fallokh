import React, { useEffect, useState } from 'react';
import { Search, Plus, MoreVertical, UserCog, X } from 'lucide-react';

interface Enseignant {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  specialite: string;
  statut: string;
}

export default function Enseignants() {
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEnseignant, setNewEnseignant] = useState({ matricule: '', nom: '', prenom: '', specialite: 'Mathématiques', statut: 'Actif' });

  const specialites = [
    'Mathématiques', 'Sciences Physiques', 'Français', 'EPS', 
    'Anglais', 'Histoire-Géo', 'SVT', 'Espagnol', 'Arabe'
  ];

  useEffect(() => {
    fetchEnseignants();
  }, []);

  const fetchEnseignants = () => {
    fetch('/api/enseignants')
      .then(r => r.json())
      .then(data => {
        setEnseignants(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleAddEnseignant = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/enseignants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEnseignant)
    })
    .then(r => r.json())
    .then(() => {
      setShowAddForm(false);
      setNewEnseignant({ matricule: '', nom: '', prenom: '', specialite: 'Mathématiques', statut: 'Actif' });
      fetchEnseignants();
    })
    .catch(console.error);
  };

  const filtered = enseignants.filter(e => 
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
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-semibold shadow-sm"
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          {showAddForm ? 'Annuler' : 'Nouvel Enseignant'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddEnseignant} className="bg-blue-50 border border-blue-100 p-5 rounded-xl flex flex-col md:flex-row gap-4 items-end shadow-sm">
          <div className="flex-1 w-full space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Matricule</label>
            <input required type="text" value={newEnseignant.matricule} onChange={e => setNewEnseignant({...newEnseignant, matricule: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm" placeholder="Ex: E1024" />
          </div>
          <div className="flex-1 w-full space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Nom</label>
            <input required type="text" value={newEnseignant.nom} onChange={e => setNewEnseignant({...newEnseignant, nom: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm" placeholder="Nom" />
          </div>
          <div className="flex-1 w-full space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Prénom</label>
            <input required type="text" value={newEnseignant.prenom} onChange={e => setNewEnseignant({...newEnseignant, prenom: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm" placeholder="Prénom" />
          </div>
          <div className="flex-1 w-full space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Spécialité</label>
            <select 
              value={newEnseignant.specialite} 
              onChange={e => setNewEnseignant({...newEnseignant, specialite: e.target.value})}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm"
            >
              {specialites.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow-sm transition-colors text-sm w-full md:w-auto">
            Enregistrer
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="border-b border-slate-100">
                <th className="py-3 px-5 font-semibold">Matricule</th>
                <th className="py-3 px-5 font-semibold">Enseignant (Nom & Prénom)</th>
                <th className="py-3 px-5 font-semibold">Spécialité</th>
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
                      <UserCog size={40} className="text-slate-300" />
                      <p>Aucun enseignant ne correspond à votre recherche.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(enseignant => (
                  <tr key={enseignant.id} className="border-b border-slate-100 even:bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-5 font-medium">{enseignant.matricule}</td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-[10px] font-bold">
                          {enseignant.prenom[0]}{enseignant.nom[0]}
                        </div>
                        <span className="font-medium">{enseignant.prenom} {enseignant.nom}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase">
                        {enseignant.specialite}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">
                        {enseignant.statut}
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
