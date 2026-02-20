import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Billing from './pages/Billing';
import Accounting from './pages/Accounting';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Help from './pages/Help';
import About from './pages/About';
import AdminUsers from './pages/AdminUsers';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const Protected = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to='/login' />;
};

const AdminOnly = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      toast.error('Unauthorized');
      nav('/');
    }
  }, [user, nav]);
  if (!user) return <Navigate to='/login' />;
  return user.role === 'ADMIN' ? children : null;
};

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route
          path='/'
          element={
            <Protected>
              <Layout />
            </Protected>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path='inventory' element={<Inventory />} />
          <Route path='orders' element={<Orders />} />
          <Route path='billing' element={<Billing />} />
          <Route path='accounting' element={<Accounting />} />
          <Route path='reports' element={<Reports />} />
          <Route
            path='admin/users'
            element={
              <AdminOnly>
                <AdminUsers />
              </AdminOnly>
            }
          />
          <Route path='settings' element={<Settings />} />
          <Route path='help' element={<Help />} />
          <Route path='about' element={<About />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
