import React, { useEffect, useState } from 'react';
import { Users, AlertTriangle, Wallet, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  tresorerie: number;
  stock_alerte: number;
  eleves: number;
}

const data = [
  { name: 'Débutant', eleves: 45 },
  { name: 'Intermédiaire', eleves: 30 },
  { name: 'Hafiz', eleves: 12 },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users size={24} className="text-blue-600" />} title="Élèves Actifs" value={stats?.eleves || 0} />
        <StatCard icon={<BookOpen size={24} className="text-blue-600" />} title="Classe" value="12" />
        <StatCard icon={<Wallet size={24} className="text-emerald-600" />} title="Trésorerie" value={`${(stats?.tresorerie || 0).toLocaleString()} FCFA`} />
        <StatCard icon={<AlertTriangle size={24} className="text-orange-600" />} title="Alertes Stock" value={stats?.stock_alerte || 0} alert />
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">Répartition par Niveau</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }} 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="eleves" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, alert }: any) {
  return (
    <div className={`bg-white p-5 rounded-xl border ${alert ? 'border-orange-200 bg-orange-50/50' : 'border-slate-200'} shadow-sm flex items-center gap-4`}>
      <div className={`p-3 rounded-lg ${alert ? 'bg-orange-100' : 'bg-slate-100'}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
