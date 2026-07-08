import React, { useEffect, useState } from 'react';
import { Search, DollarSign, UserCheck, Wallet, ChevronDown, Check, Plus, ArrowDownRight, ArrowUpRight, Activity } from 'lucide-react';

export default function Tresorerie() {
  const [activeTab, setActiveTab] = useState<'eleves' | 'enseignants' | 'entrees' | 'sorties' | 'bilan' | 'tarifs'>('eleves');
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Trésorerie</h2>
        <div className="flex flex-wrap bg-slate-100 p-1 rounded-lg gap-1">
          <button
            onClick={() => setActiveTab('eleves')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'eleves' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Paiements Élèves
          </button>
          <button
            onClick={() => setActiveTab('enseignants')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'enseignants' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Salaires Enseignants
          </button>
          <button
            onClick={() => setActiveTab('entrees')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'entrees' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Autres Entrées
          </button>
          <button
            onClick={() => setActiveTab('sorties')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'sorties' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Autres Sorties
          </button>
          <button
            onClick={() => setActiveTab('bilan')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'bilan' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Bilan
          </button>
          <button
            onClick={() => setActiveTab('tarifs')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'tarifs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Tarifs
          </button>
        </div>
      </div>

      {activeTab === 'eleves' && <PaiementsEleves />}
      {activeTab === 'enseignants' && <SalairesEnseignants />}
      {activeTab === 'entrees' && <AutresTransactions type="entrees" />}
      {activeTab === 'sorties' && <AutresTransactions type="sorties" />}
      {activeTab === 'bilan' && <Bilan />}
      {activeTab === 'tarifs' && <Tarifs />}
    </div>
  );
}

function PaiementsEleves() {
  const [eleves, setEleves] = useState<any[]>([]);
  const [tarifs, setTarifs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const moisList = ['Inscription', 'Octobre', 'Novembre', 'Décembre', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    Promise.all([
      fetch('/api/tresorerie/eleves').then(r => r.json()),
      fetch('/api/tarifs').then(r => r.json())
    ])
    .then(([elevesData, tarifsData]) => {
      setEleves(elevesData);
      setTarifs(tarifsData);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  const handlePayer = (eleve: any, mois: string) => {
    const tarif = tarifs.find(t => t.id === eleve.classe_id);
    const defaultInscription = 10000;
    const defaultMensualite = 15000;
    
    const montant = mois === 'Inscription' 
      ? (tarif ? tarif.inscription : defaultInscription) 
      : (tarif ? tarif.mensualite : defaultMensualite);

    fetch('/api/tresorerie/eleves/paiement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eleve_id: eleve.id, mois, montant })
    })
    .then(r => r.json())
    .then(() => {
      fetchData();
    })
    .catch(console.error);
  };

  const filtered = eleves.filter(e => 
    e.nom.toLowerCase().includes(search.toLowerCase()) || 
    e.prenom.toLowerCase().includes(search.toLowerCase()) ||
    (e.classe_nom && e.classe_nom.toLowerCase().includes(search.toLowerCase()))
  );

  // Group by class
  const groupedEleves = filtered.reduce((acc, eleve) => {
    const classeName = eleve.classe_nom || 'Non assignée';
    if (!acc[classeName]) acc[classeName] = [];
    acc[classeName].push(eleve);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
      <div className="p-4 border-b border-slate-100">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un élève ou une classe..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm"
          />
        </div>
      </div>
      <div className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 text-slate-500">
            <tr className="border-b border-slate-100">
              <th className="py-3 px-5 font-semibold sticky left-0 bg-slate-50 z-10">Élève</th>
              {moisList.map(m => (
                <th key={m} className="py-3 px-3 font-semibold text-center whitespace-nowrap min-w-[100px]">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={moisList.length + 1} className="py-12 text-center text-slate-500">Chargement...</td>
              </tr>
            ) : (
              Object.entries(groupedEleves).map(([classeName, elevesInClass]) => (
                <React.Fragment key={classeName}>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <td colSpan={moisList.length + 1} className="py-2 px-5 font-bold text-slate-800 sticky left-0">
                      Classe: {classeName}
                    </td>
                  </tr>
                  {elevesInClass.map(eleve => (
                    <tr key={eleve.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-5 sticky left-0 bg-white group-hover:bg-slate-50 font-medium">
                        <div className="whitespace-nowrap">{eleve.prenom} {eleve.nom}</div>
                      </td>
                      {moisList.map(mois => {
                        const isPaye = eleve.paiements && eleve.paiements[mois];
                        return (
                          <td key={mois} className="py-3 px-3 text-center">
                            {isPaye ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600" title={`Payé: ${isPaye.montant} FCFA`}>
                                <Check size={16} />
                              </div>
                            ) : (
                              <button 
                                onClick={() => handlePayer(eleve, mois)}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                                title="Marquer comme payé"
                              >
                                <DollarSign size={16} />
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SalairesEnseignants() {
  const [enseignants, setEnseignants] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const moisList = ['Octobre', 'Novembre', 'Décembre', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    fetch('/api/tresorerie/enseignants')
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

  const handlePayer = (enseignant: any, mois: string) => {
    const montant = enseignant.salaire_base || 150000;
    fetch('/api/tresorerie/enseignants/salaire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enseignant_id: enseignant.id, mois, montant })
    })
    .then(r => r.json())
    .then(() => {
      fetchData();
    })
    .catch(console.error);
  };

  const handleUpdateSalaire = (id: number, salaire_base: number) => {
    fetch(`/api/enseignants/${id}/salaire`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ salaire_base })
    })
    .then(r => r.json())
    .then(() => {
      fetchData();
    })
    .catch(console.error);
  };

  const filtered = enseignants.filter(e => 
    e.nom.toLowerCase().includes(search.toLowerCase()) || 
    e.prenom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
      <div className="p-4 border-b border-slate-100">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un enseignant..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm"
          />
        </div>
      </div>
      <div className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 text-slate-500">
            <tr className="border-b border-slate-100">
              <th className="py-3 px-5 font-semibold sticky left-0 bg-slate-50 z-10">Enseignant (Spécialité)</th>
              <th className="py-3 px-5 font-semibold text-right min-w-[150px]">Salaire de Base (FCFA)</th>
              {moisList.map(m => (
                <th key={m} className="py-3 px-3 font-semibold text-center whitespace-nowrap min-w-[100px]">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={moisList.length + 2} className="py-12 text-center text-slate-500">Chargement...</td>
              </tr>
            ) : (
              filtered.map(enseignant => (
                <tr key={enseignant.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-5 sticky left-0 bg-white group-hover:bg-slate-50 font-medium">
                    <div className="whitespace-nowrap">{enseignant.prenom} {enseignant.nom}</div>
                    <div className="text-xs text-slate-400">{enseignant.specialite}</div>
                  </td>
                  <td className="py-3 px-5 text-right">
                    <input 
                      type="number" 
                      value={enseignant.salaire_base}
                      onChange={e => handleUpdateSalaire(enseignant.id, parseInt(e.target.value) || 0)}
                      className="w-32 text-right px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm font-semibold text-blue-600"
                    />
                  </td>
                  {moisList.map(mois => {
                    const isPaye = enseignant.salaires && enseignant.salaires[mois];
                    return (
                      <td key={mois} className="py-3 px-3 text-center">
                        {isPaye ? (
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600" title={`Payé: ${isPaye.montant} FCFA`}>
                            <Check size={16} />
                          </div>
                        ) : (
                          <button 
                            onClick={() => handlePayer(enseignant, mois)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                            title="Payer salaire"
                          >
                            <Wallet size={16} />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AutresTransactions({ type }: { type: 'entrees' | 'sorties' }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [libelle, setLibelle] = useState('');
  const [montant, setMontant] = useState('');

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = () => {
    fetch(`/api/tresorerie/${type}`)
      .then(r => r.json())
      .then(data => {
        setTransactions(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!libelle || !montant) return;
    
    fetch(`/api/tresorerie/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ libelle, montant: parseInt(montant, 10) })
    })
    .then(r => r.json())
    .then(() => {
      setLibelle('');
      setMontant('');
      fetchData();
    })
    .catch(console.error);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col md:flex-row gap-4 items-end shadow-sm">
        <div className="flex-1 w-full space-y-1">
          <label className="text-xs font-bold text-slate-600 uppercase">Libellé de la transaction</label>
          <input required type="text" value={libelle} onChange={e => setLibelle(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm" placeholder="Ex: Don, Achat fournitures..." />
        </div>
        <div className="flex-1 w-full space-y-1">
          <label className="text-xs font-bold text-slate-600 uppercase">Montant (FCFA)</label>
          <input required type="number" min="0" value={montant} onChange={e => setMontant(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm" placeholder="Ex: 50000" />
        </div>
        <button type="submit" className={`px-6 py-2 rounded-lg font-semibold shadow-sm transition-colors text-sm w-full md:w-auto text-white flex items-center justify-center gap-2 ${type === 'entrees' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
          <Plus size={18} />
          Ajouter
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="border-b border-slate-100">
                <th className="py-3 px-5 font-semibold">Date</th>
                <th className="py-3 px-5 font-semibold">Libellé</th>
                <th className="py-3 px-5 font-semibold text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-500">Chargement...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-500">Aucune transaction enregistrée</td>
                </tr>
              ) : (
                transactions.map((t, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5">{new Date(t.date_transaction).toLocaleDateString()}</td>
                    <td className="py-4 px-5 font-medium">{t.libelle}</td>
                    <td className={`py-4 px-5 text-right font-bold ${type === 'entrees' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {type === 'entrees' ? '+' : '-'}{t.montant.toLocaleString()} FCFA
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

function Bilan() {
  const [bilan, setBilan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tresorerie/bilan')
      .then(r => r.json())
      .then(data => {
        setBilan(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <div className="py-12 text-center text-slate-500">Chargement du bilan...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-500">Total Entrées</h3>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{bilan?.total_entrees.toLocaleString()} FCFA</div>
            <div className="mt-2 text-sm text-slate-500">
              <p>Paiements élèves: {bilan?.paiements_eleves.toLocaleString()} FCFA</p>
              <p>Autres entrées: {bilan?.autres_entrees.toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-500">Total Sorties</h3>
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">{bilan?.total_sorties.toLocaleString()} FCFA</div>
            <div className="mt-2 text-sm text-slate-500">
              <p>Salaires enseignants: {bilan?.salaires_enseignants.toLocaleString()} FCFA</p>
              <p>Autres sorties: {bilan?.autres_sorties.toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>

        <div className={`border p-6 rounded-2xl shadow-sm flex flex-col justify-between ${bilan?.solde >= 0 ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-rose-600 border-rose-600 text-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white/80">Solde Global</h3>
            <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center">
              <Activity size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold">{bilan?.solde.toLocaleString()} FCFA</div>
            <p className="mt-2 text-sm text-white/80">Entrées - Sorties</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tarifs() {
  const [tarifs, setTarifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    fetch('/api/tarifs')
      .then(r => r.json())
      .then(data => {
        setTarifs(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  const handleUpdate = (id: number, inscription: number, mensualite: number) => {
    fetch(`/api/tarifs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inscription, mensualite })
    })
    .then(r => r.json())
    .then(() => {
      fetchData();
    })
    .catch(console.error);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 border-b border-slate-100">
        <h3 className="font-semibold text-lg text-slate-800">Tarifs par Niveau</h3>
        <p className="text-sm text-slate-500">Configurez les montants d'inscription et de mensualité pour chaque classe.</p>
      </div>
      <div className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 text-slate-500">
            <tr className="border-b border-slate-100">
              <th className="py-3 px-5 font-semibold">Classe</th>
              <th className="py-3 px-5 font-semibold">Cycle</th>
              <th className="py-3 px-5 font-semibold text-right">Inscription (FCFA)</th>
              <th className="py-3 px-5 font-semibold text-right">Mensualité (FCFA)</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-500">Chargement...</td>
              </tr>
            ) : (
              tarifs.map(tarif => (
                <tr key={tarif.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-5 font-bold text-slate-900">{tarif.nom}</td>
                  <td className="py-4 px-5 text-slate-500">{tarif.cycle}</td>
                  <td className="py-4 px-5 text-right">
                    <input 
                      type="number" 
                      value={tarif.inscription}
                      onChange={e => handleUpdate(tarif.id, parseInt(e.target.value) || 0, tarif.mensualite)}
                      className="w-32 text-right px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm font-semibold text-emerald-600"
                    />
                  </td>
                  <td className="py-4 px-5 text-right">
                    <input 
                      type="number" 
                      value={tarif.mensualite}
                      onChange={e => handleUpdate(tarif.id, tarif.inscription, parseInt(e.target.value) || 0)}
                      className="w-32 text-right px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm font-semibold text-blue-600"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
