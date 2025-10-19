import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute() {
  const refreshToken = localStorage.getItem('refreshToken');
  const user = localStorage.getItem('user');
  
  if (!refreshToken || !user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
}
