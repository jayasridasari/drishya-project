import { Navigate, Outlet } from 'react-router-dom';

export default function AdminRoute() {
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
    return <Outlet />;
  } catch {
    return <Navigate to="/login" replace />;
  }
}
