import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Settings(){
  const [s,setS]=useState<any>({companyName:'',theme:'dark',reorderThresholdDefault:10});
  useEffect(()=>{api.get('/settings').then(r=>setS(r.data.data));},[]);
  return <div className='card space-y-2'><input className='input w-full' value={s.companyName} onChange={e=>setS({...s,companyName:e.target.value})}/><input className='input w-full' value={s.theme} onChange={e=>setS({...s,theme:e.target.value})}/><button className='btn' onClick={()=>api.put('/settings',s)}>Save</button></div>
}
