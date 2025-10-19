import { Outlet, Navigate } from 'react-router-dom';

export default function AdminRoute() {
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    return <Navigate to="/login" />;
  }
  
  try {
    const user = JSON.parse(userStr);
    return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/" />;
  } catch {
    return <Navigate to="/login" />;
  }
}
