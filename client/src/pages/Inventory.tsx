import { useEffect, useState } from 'react';
import { api } from '../api/client';
import toast from 'react-hot-toast';

export default function Inventory(){
  const [items,setItems]=useState<any[]>([]); const [f,setF]=useState({sku:'',name:'',category:'',unitPrice:1,baseQuantity:0});
  const load=()=>api.get('/inventory/items').then(r=>setItems(r.data.data));
  useEffect(load,[]);
  return <div className='space-y-3'>
    <div className='card overflow-auto'><table className='w-full text-sm'><thead><tr><th>Name</th><th>Stock</th><th>Status</th></tr></thead><tbody>{items.map(i=><tr key={i._id}><td>{i.name}</td><td>{i.stock}</td><td>{i.stock<=i.reorderThreshold?'LOW':'OK'}</td></tr>)}</tbody></table></div>
    <div className='card grid md:grid-cols-6 gap-2'>{Object.entries(f).map(([k,v])=><input key={k} className='input' value={String(v)} placeholder={k} onChange={e=>setF({...f,[k]:k==='unitPrice'||k==='baseQuantity'?Number(e.target.value):e.target.value})}/>)}<button className='btn' onClick={async()=>{await api.post('/inventory/items',f);toast.success('Saved');load();}}>Add Item</button></div>
    <div className='card'><button className='btn' onClick={()=>window.open('http://localhost:4000/api/reports/inventory.csv')}>Export CSV</button></div>
  </div>
}
