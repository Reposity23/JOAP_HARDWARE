import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api/client';

type UserRow = {
  _id: string;
  username: string;
  role: 'ADMIN' | 'EMPLOYEE';
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
};

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const usernameRule = /^[a-zA-Z0-9_.-]{4,32}$/;

const Modal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <div className='fixed inset-0 bg-black/60 grid place-items-center z-50 p-3'>
    <div className='card w-full max-w-lg'>
      {children}
      <div className='pt-3 text-right'>
        <button className='btn bg-slate-700 hover:bg-slate-600' onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

export default function AdminUsers() {
  const [items, setItems] = useState<UserRow[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [showTempPass, setShowTempPass] = useState(false);
  const [createForm, setCreateForm] = useState({ username: '', temporaryPassword: '', role: 'EMPLOYEE', isActive: true });

  const [roleTarget, setRoleTarget] = useState<UserRow | null>(null);
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null);
  const [resetPass, setResetPass] = useState('');
  const [oneTimePassword, setOneTimePassword] = useState('');

  const filters = useMemo(() => ({ search, role: role || undefined, status: status || undefined, page, pageSize }), [search, role, status, page, pageSize]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/admin/users', { params: filters });
      setItems(r.data.data.items);
      setTotalPages(r.data.data.pagination.totalPages || 1);
    } catch {
      toast.error('Failed to load users');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [filters.search, filters.role, filters.status, filters.page, filters.pageSize]);

  const createUser = async () => {
    if (!usernameRule.test(createForm.username)) return toast.error('Invalid username format');
    if (!passwordRule.test(createForm.temporaryPassword)) return toast.error('Password needs upper/lower/number and 8+ chars');
    try {
      const r = await api.post('/admin/users', createForm);
      toast.success('User created');
      setItems((prev) => [r.data.data.user, ...prev]);
      setCreateOpen(false);
      setOneTimePassword(r.data.data.temporaryPassword);
      setCreateForm({ username: '', temporaryPassword: '', role: 'EMPLOYEE', isActive: true });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Create failed');
    }
  };

  return (
    <div className='space-y-3'>
      <div className='card flex flex-col md:flex-row md:items-center gap-2'>
        <input className='input flex-1' placeholder='Search username' value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
        <select className='input' value={role} onChange={(e) => { setPage(1); setRole(e.target.value); }}>
          <option value=''>All Roles</option><option value='ADMIN'>ADMIN</option><option value='EMPLOYEE'>EMPLOYEE</option>
        </select>
        <select className='input' value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value=''>All Status</option><option value='ACTIVE'>Active</option><option value='INACTIVE'>Inactive</option>
        </select>
        <button className='btn md:ml-auto' onClick={() => setCreateOpen(true)}>Create User</button>
      </div>

      <div className='hidden md:block card overflow-auto max-h-[65vh]'>
        <table className='w-full text-sm'>
          <thead className='sticky top-0 bg-slate-900'>
            <tr><th className='text-left p-2'>Username</th><th className='text-left p-2'>Role</th><th className='text-left p-2'>Status</th><th className='text-left p-2'>Created At</th><th className='text-left p-2'>Last Login</th><th className='text-left p-2'>Actions</th></tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u._id} className='border-t border-slate-800'>
                <td className='p-2'>{u.username}</td>
                <td className='p-2'>{u.role}</td>
                <td className='p-2'>{u.isActive ? 'Active' : 'Inactive'}</td>
                <td className='p-2'>{new Date(u.createdAt).toLocaleString()}</td>
                <td className='p-2'>{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}</td>
                <td className='p-2 flex gap-2'>
                  <button className='btn' onClick={async () => { await api.patch(`/admin/users/${u._id}/status`, { isActive: !u.isActive }); toast.success('Status updated'); load(); }}>{u.isActive ? 'Deactivate' : 'Activate'}</button>
                  <button className='btn bg-indigo-600 hover:bg-indigo-500' onClick={() => setRoleTarget(u)}>Change Role</button>
                  <button className='btn bg-amber-600 hover:bg-amber-500' onClick={() => { setResetTarget(u); setResetPass(''); }}>Reset Password</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='md:hidden space-y-2'>
        {items.map((u) => (
          <div key={u._id} className='card text-sm space-y-2'>
            <div className='font-semibold'>{u.username}</div>
            <div>{u.role} • {u.isActive ? 'Active' : 'Inactive'}</div>
            <div>Created: {new Date(u.createdAt).toLocaleDateString()}</div>
            <div>Last Login: {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</div>
            <div className='flex flex-wrap gap-2'>
              <button className='btn' onClick={async () => { await api.patch(`/admin/users/${u._id}/status`, { isActive: !u.isActive }); toast.success('Status updated'); load(); }}>{u.isActive ? 'Deactivate' : 'Activate'}</button>
              <button className='btn bg-indigo-600 hover:bg-indigo-500' onClick={() => setRoleTarget(u)}>Change Role</button>
              <button className='btn bg-amber-600 hover:bg-amber-500' onClick={() => { setResetTarget(u); setResetPass(''); }}>Reset Password</button>
            </div>
          </div>
        ))}
      </div>

      <div className='card flex items-center justify-between'>
        <button className='btn bg-slate-700 hover:bg-slate-600' disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>Prev</button>
        <span className='text-sm'>Page {page} / {totalPages}</span>
        <button className='btn bg-slate-700 hover:bg-slate-600' disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>

      {createOpen && (
        <Modal onClose={() => setCreateOpen(false)}>
          <h3 className='text-lg font-semibold mb-3'>Create User</h3>
          <div className='grid gap-2'>
            <input className='input' placeholder='Username' value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} />
            <div className='flex gap-2'>
              <input className='input flex-1' type={showTempPass ? 'text' : 'password'} placeholder='Temporary Password' value={createForm.temporaryPassword} onChange={(e) => setCreateForm({ ...createForm, temporaryPassword: e.target.value })} />
              <button className='btn bg-slate-700 hover:bg-slate-600' onClick={() => setShowTempPass((v) => !v)}>{showTempPass ? 'Hide' : 'Show'}</button>
            </div>
            <select className='input' value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as 'ADMIN' | 'EMPLOYEE' })}><option>EMPLOYEE</option><option>ADMIN</option></select>
            <label className='text-sm flex items-center gap-2'><input type='checkbox' checked={createForm.isActive} onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked })} /> Active</label>
            <button className='btn' onClick={createUser}>Save</button>
          </div>
        </Modal>
      )}

      {roleTarget && (
        <Modal onClose={() => setRoleTarget(null)}>
          <h3 className='text-lg font-semibold mb-3'>Change Role - {roleTarget.username}</h3>
          <select className='input w-full' value={roleTarget.role} onChange={(e) => setRoleTarget({ ...roleTarget, role: e.target.value as 'ADMIN' | 'EMPLOYEE' })}><option>EMPLOYEE</option><option>ADMIN</option></select>
          <button className='btn mt-3' onClick={async () => { await api.patch(`/admin/users/${roleTarget._id}/role`, { role: roleTarget.role }); toast.success('Role updated'); setRoleTarget(null); load(); }}>Apply</button>
        </Modal>
      )}

      {resetTarget && (
        <Modal onClose={() => setResetTarget(null)}>
          <h3 className='text-lg font-semibold mb-1'>Reset Password - {resetTarget.username}</h3>
          <p className='text-xs text-amber-300 mb-2'>Sensitive action. Share temporary password securely.</p>
          <input className='input w-full' type='password' placeholder='New Temporary Password' value={resetPass} onChange={(e) => setResetPass(e.target.value)} />
          <button className='btn mt-3 bg-amber-600 hover:bg-amber-500' onClick={async () => {
            if (!passwordRule.test(resetPass)) return toast.error('Password policy not met');
            const r = await api.post(`/admin/users/${resetTarget._id}/reset-password`, { newPassword: resetPass });
            setOneTimePassword(r.data.data.temporaryPassword);
            setResetTarget(null);
            toast.success('Password reset');
          }}>Confirm Reset</button>
        </Modal>
      )}

      {oneTimePassword && (
        <Modal onClose={() => setOneTimePassword('')}>
          <h3 className='text-lg font-semibold mb-2'>One-time Temporary Password</h3>
          <div className='input font-mono'>{oneTimePassword}</div>
          <button className='btn mt-3' onClick={async () => { await navigator.clipboard.writeText(oneTimePassword); toast.success('Copied'); }}>Copy</button>
        </Modal>
      )}
    </div>
  );
}
