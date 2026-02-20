import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Dashboard(){
  const [orders,setOrders]=useState<any[]>([]);
  useEffect(()=>{api.get('/orders').then(r=>setOrders(r.data.data));},[]);
  const stats=['Pending Payment','Ready Dispatch','In Transit','Completed'].map(s=>({s,c:orders.filter(o=>o.status===s).length}));
  return <div className='grid md:grid-cols-4 gap-3'>{stats.map(x=><div className='card' key={x.s}><div className='text-slate-400 text-xs'>{x.s}</div><div className='text-2xl font-bold'>{x.c}</div></div>)}</div>
}
