import { Outlet, Navigate } from 'react-router-dom';

export default function PrivateRoute() {
  const isAuth = !!localStorage.getItem('refreshToken');
  return isAuth ? <Outlet /> : <Navigate to="/login" />;
}
