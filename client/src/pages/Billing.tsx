import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Billing(){
  const [orders,setOrders]=useState<any[]>([]); const [f,setF]=useState({orderId:'',gcashRef:'GC12345678',amountPaid:1,paymentDate:new Date().toISOString().slice(0,10)});
  const load=()=>api.get('/orders').then(r=>setOrders(r.data.data)); useEffect(load,[]);
  return <div className='space-y-3'><div className='card'><select className='input' onChange={e=>setF({...f,orderId:e.target.value})}><option>Order</option>{orders.map(o=><option key={o._id} value={o._id}>{o.trackingNo} - {o.status}</option>)}</select><button className='btn ml-2' onClick={async()=>{await api.post('/billing/log',f);load();}}>Log Payment</button></div></div>
}
