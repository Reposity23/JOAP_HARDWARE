import { useState } from 'react';
import { api } from '../api/client';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [username,setU]=useState('admin'); const [password,setP]=useState('admin123');
  const [token,setToken]=useState(''); const nav=useNavigate();
  return <div className='min-h-screen grid place-items-center bg-slate-950'>
    <div className='card w-full max-w-md space-y-2'><h2 className='text-xl font-semibold'>Login</h2>
      <input className='input w-full' value={username} onChange={e=>setU(e.target.value)} placeholder='username'/>
      <input className='input w-full' type='password' value={password} onChange={e=>setP(e.target.value)} placeholder='password'/>
      <button className='btn w-full' onClick={async()=>{try{const r=await api.post('/auth/login',{username,password});localStorage.setItem('token',r.data.data.token);nav('/')}catch{toast.error('Login failed')}}}>Login</button>
      <button className='text-xs underline' onClick={async()=>{const r=await api.post('/auth/forgot-password',{username});setToken(r.data.data.token)}}>Forgot Password</button>
      {token&&<div className='text-xs'>Reset token: {token}</div>}
    </div>
  </div>
}
