import { Outlet, Navigate } from 'react-router-dom';

export default function AdminRoute() {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/" />;
}
