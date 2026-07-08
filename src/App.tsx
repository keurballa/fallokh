import React, { useState } from 'react';
import { LayoutDashboard, Users, UserCog, Package, GraduationCap, Wallet } from 'lucide-react';
import Dashboard from './views/Dashboard';
import Eleves from './views/Eleves';
import Enseignants from './views/Enseignants';
import Classes from './views/Classes';
import Tresorerie from './views/Tresorerie';

export default function App() {
  const [view, setView] = useState('dashboard');
  const [lang, setLang] = useState('fr');

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-10">
        <div className="p-5 flex items-center gap-3 text-white font-bold text-xl border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-inner">
            SD
          </div>
          Sunu Daara Pro
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <NavItem icon={<LayoutDashboard />} label="Tableau de Bord" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavItem icon={<GraduationCap />} label="Classes" active={view === 'classes'} onClick={() => setView('classes')} />
          <NavItem icon={<Users />} label="Élèves" active={view === 'eleves'} onClick={() => setView('eleves')} />
          <NavItem icon={<UserCog />} label="Enseignants" active={view === 'enseignants'} onClick={() => setView('enseignants')} />
          <NavItem icon={<Wallet />} label="Trésorerie" active={view === 'tresorerie'} onClick={() => setView('tresorerie')} />
          <NavItem icon={<Package />} label="Logistique" active={view === 'logistique'} onClick={() => setView('logistique')} />
        </nav>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
          <h2 className="text-xl font-semibold text-slate-800 capitalize">{view.replace('-', ' ')}</h2>
          <div className="flex items-center gap-4">
            <select 
              value={lang} 
              onChange={e => setLang(e.target.value)}
              className="bg-slate-100 text-slate-700 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 outline-none border border-slate-200 cursor-pointer"
            >
              <option value="fr">🇫🇷 FR</option>
              <option value="wo">🇸🇳 WO</option>
              <option value="ar">🇸🇦 AR</option>
            </select>
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold shadow-sm">
              AD
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {view === 'dashboard' && <Dashboard />}
          {view === 'classes' && <Classes />}
          {view === 'eleves' && <Eleves />}
          {view === 'enseignants' && <Enseignants />}
          {view === 'tresorerie' && <Tresorerie />}
          {view !== 'dashboard' && view !== 'eleves' && view !== 'enseignants' && view !== 'classes' && view !== 'tresorerie' && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
              <Package size={48} className="opacity-20" />
              <p className="text-lg">Module en cours de développement...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors font-medium text-sm ${
        active 
          ? 'bg-slate-800 text-white' 
          : 'hover:bg-slate-800 hover:text-white text-slate-400'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      <span>{label}</span>
    </button>
  );
}
