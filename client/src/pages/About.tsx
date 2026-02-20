import { useState } from 'react';
import { api } from '../api/client';

export default function About(){const [m,setM]=useState(''); return <div className='card space-y-2'><div>Version 1.0.0</div><div>Developer credit: John Marwin</div><textarea className='input w-full' value={m} onChange={e=>setM(e.target.value)} /><button className='btn' onClick={()=>api.post('/misc/feedback',{message:m})}>Submit Feedback</button></div>}
