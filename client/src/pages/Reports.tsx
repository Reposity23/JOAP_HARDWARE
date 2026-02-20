import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer } from 'recharts';

export default function Reports(){
  const [d,setD]=useState<any>();
  useEffect(()=>{api.get('/reports/sales-forecast').then(r=>setD(r.data.data));},[]);
  const data=(d?.history||[]).map((h:any)=>({day:h._id,sales:h.total}));
  return <div className='space-y-3'><div className='card h-72'><ResponsiveContainer width='100%' height='100%'><LineChart data={data}><XAxis dataKey='day'/><YAxis/><Tooltip/><Line type='monotone' dataKey='sales' stroke='#3b82f6'/></LineChart></ResponsiveContainer></div><div className='card'><button className='btn' onClick={()=>window.open('http://localhost:4000/api/reports/financial.pdf')}>Download Financial PDF</button></div></div>
}
