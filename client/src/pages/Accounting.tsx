import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Accounting(){
  const [ledger,setLedger]=useState<any[]>([]);
  const [gid,setGid]=useState('');
  const load=()=>api.get('/accounting/ledger').then(r=>setLedger(r.data.data)); useEffect(load,[]);
  return <div className='space-y-2'><div className='card overflow-auto max-h-96'>{ledger.map(l=><div key={l._id} className='text-sm'>{l.groupId} D{l.debit} C{l.credit}</div>)}</div><div className='card'><input className='input' value={gid} onChange={e=>setGid(e.target.value)} placeholder='Group ID'/><button className='btn ml-2' onClick={async()=>{await api.post('/accounting/reverse/'+gid);load();}}>Reverse</button></div></div>
}
