import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../context/auth';
import { api } from '../api/client';
import { useState } from 'react';

const nav = [
  ['/', 'Dashboard'], ['/inventory', 'Inventory'], ['/orders', 'Orders'], ['/billing', 'Billing'], ['/accounting', 'Accounting'], ['/reports', 'Reports'], ['/admin/users', 'Users'], ['/settings', 'Settings'], ['/help', 'Help'], ['/about', 'About']
];

export default function Layout() {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const n = useNavigate();
  return <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
    <aside className="w-64 p-4 border-r border-slate-800 hidden md:block">
      <h1 className="font-bold text-xl">JOAP SMS</h1>
      <p className="text-xs text-slate-400 mb-4">{user?.role}</p>
      <div className="space-y-1">{nav.filter(([p])=> user?.role==='ADMIN' || !['/settings','/admin/users'].includes(p)).map(([p,l])=><Link className="block px-3 py-2 rounded hover:bg-slate-800" key={p} to={p}>{l}</Link>)}</div>
    </aside>
    <main className="flex-1 p-4 space-y-4">
      <div className="card relative">
        <div className="flex items-center gap-2"><Search size={16}/><input className="input flex-1" placeholder="Global search" value={q} onChange={async e=>{const v=e.target.value;setQ(v); if(v.length>1){const r=await api.get('/search',{params:{q:v}});setResults(r.data.data)} else setResults([]);}}/></div>
        {results.length>0 && <div className="absolute z-10 bg-slate-900 border border-slate-700 mt-2 w-full p-2 rounded">{results.map((r)=><div key={r.type+r.id} className="text-sm py-1">{r.type}: {r.label}</div>)}</div>}
      </div>
      <Outlet />
      <button className="btn" onClick={async()=>{await api.post('/auth/logout');localStorage.removeItem('token');n('/login')}}>Logout</button>
    </main>
  </div>
}
