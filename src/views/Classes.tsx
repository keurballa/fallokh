import React, { useEffect, useState } from 'react';
import { Search, Plus, GraduationCap, ChevronRight, ArrowLeft, X } from 'lucide-react';

interface Classe {
  id: number;
  nom: string;
  cycle: string;
  elevesCount: number;
}

interface Eleve {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  statut: string;
}

export default function Classes() {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClasse, setSelectedClasse] = useState<Classe | null>(null);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [loadingEleves, setLoadingEleves] = useState(false);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEleve, setNewEleve] = useState({ matricule: '', nom: '', prenom: '', statut: 'Actif' });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = () => {
    fetch('/api/classes')
      .then(r => r.json())
      .then(data => {
        setClasses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSelectClasse = (c: Classe) => {
    setSelectedClasse(c);
    fetchEleves(c.id);
  };

  const fetchEleves = (classeId: number) => {
    setLoadingEleves(true);
    fetch(`/api/classes/${classeId}/eleves`)
      .then(r => r.json())
      .then(data => {
        setEleves(data);
        setLoadingEleves(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingEleves(false);
      });
  };

  const handleAddEleve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClasse) return;
    
    fetch('/api/eleves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newEleve, classe_id: selectedClasse.id, niveau: selectedClasse.cycle })
    })
    .then(r => r.json())
    .then(() => {
      setShowAddForm(false);
      setNewEleve({ matricule: '', nom: '', prenom: '', statut: 'Actif' });
      fetchEleves(selectedClasse.id);
      fetchClasses(); // Update counts
    })
    .catch(console.error);
  };

  const cycles = ['Préscolaire', 'Élémentaire', 'Moyen', 'Lycée'];

  if (selectedClasse) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setSelectedClasse(null); setShowAddForm(false); }}
              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Classe de {selectedClasse.nom}</h2>
              <p className="text-sm text-slate-500">{selectedClasse.cycle} • {eleves.length} élèves</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-semibold shadow-sm"
          >
            {showAddForm ? <X size={18} /> : <Plus size={18} />}
            {showAddForm ? 'Fermer' : 'Ajouter un élève'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddEleve} className="bg-blue-50 border border-blue-100 p-5 rounded-xl flex flex-col sm:flex-row gap-4 items-end shadow-sm">
            <div className="flex-1 w-full space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Matricule</label>
              <input required type="text" value={newEleve.matricule} onChange={e => setNewEleve({...newEleve, matricule: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm" placeholder="Ex: M1024" />
            </div>
            <div className="flex-1 w-full space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Nom</label>
              <input required type="text" value={newEleve.nom} onChange={e => setNewEleve({...newEleve, nom: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm" placeholder="Nom de famille" />
            </div>
            <div className="flex-1 w-full space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Prénom</label>
              <input required type="text" value={newEleve.prenom} onChange={e => setNewEleve({...newEleve, prenom: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm" placeholder="Prénom" />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow-sm transition-colors text-sm w-full sm:w-auto">
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
                  <th className="py-3 px-5 font-semibold">Nom</th>
                  <th className="py-3 px-5 font-semibold">Prénom</th>
                  <th className="py-3 px-5 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {loadingEleves ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">Chargement des élèves...</td>
                  </tr>
                ) : eleves.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">Aucun élève dans cette classe.</td>
                  </tr>
                ) : (
                  eleves.map(eleve => (
                    <tr key={eleve.id} className="border-b border-slate-100 even:bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-5 font-medium">{eleve.matricule}</td>
                      <td className="py-4 px-5">{eleve.nom}</td>
                      <td className="py-4 px-5">{eleve.prenom}</td>
                      <td className="py-4 px-5">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">
                          {eleve.statut}
                        </span>
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

  return (
    <div className="space-y-8">
      {cycles.map(cycle => {
        const cycleClasses = classes.filter(c => c.cycle === cycle);
        if (cycleClasses.length === 0) return null;
        
        return (
          <div key={cycle} className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">{cycle}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cycleClasses.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => handleSelectClasse(c)}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-start gap-4 hover:border-blue-400 hover:shadow-md transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <GraduationCap size={24} />
                  </div>
                  <div className="w-full flex items-end justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">{c.nom}</h4>
                      <p className="text-sm text-slate-500 mt-1">{c.elevesCount} élèves</p>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
