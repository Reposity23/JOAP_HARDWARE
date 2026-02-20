import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Orders(){
  const [orders,setOrders]=useState<any[]>([]); const [customers,setCustomers]=useState<any[]>([]); const [items,setItems]=useState<any[]>([]);
  const [f,setF]=useState({customerId:'',sourceChannel:'phone',itemId:'',qty:1,unitPrice:1});
  const load=()=>api.get('/orders').then(r=>setOrders(r.data.data));
  useEffect(()=>{load();api.get('/misc/customers').then(r=>setCustomers(r.data.data));api.get('/inventory/items').then(r=>setItems(r.data.data));},[]);
  return <div className='space-y-3'>
    <div className='card overflow-auto'><table className='w-full text-sm'><thead><tr><th>Tracking</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead><tbody>{orders.map(o=><tr key={o._id}><td>{o.trackingNo}</td><td>{o.customerId?.name}</td><td>{o.status}</td><td>{o.total}</td></tr>)}</tbody></table></div>
    <div className='card grid md:grid-cols-6 gap-2'>
      <select className='input' onChange={e=>setF({...f,customerId:e.target.value})}><option>Customer</option>{customers.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select>
      <select className='input' onChange={e=>setF({...f,itemId:e.target.value})}><option>Item</option>{items.map(i=><option key={i._id} value={i._id}>{i.name}</option>)}</select>
      <input className='input' value={f.qty} onChange={e=>setF({...f,qty:Number(e.target.value)})}/>
      <input className='input' value={f.unitPrice} onChange={e=>setF({...f,unitPrice:Number(e.target.value)})}/>
      <input className='input' value={f.sourceChannel} onChange={e=>setF({...f,sourceChannel:e.target.value})}/>
      <button className='btn' onClick={async()=>{await api.post('/orders',{customerId:f.customerId,sourceChannel:f.sourceChannel,items:[{itemId:f.itemId,qty:f.qty,unitPrice:f.unitPrice}]});load();}}>Create Order</button>
    </div>
  </div>
}
