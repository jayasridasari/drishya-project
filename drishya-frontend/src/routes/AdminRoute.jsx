import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Loader from '../components/common/Loader';

function AdminRoute() {
  const { user, loading } = useUser();
  
  console.log('🔒 AdminRoute check:', { user, loading }); // Debug
  
  if (loading) return <Loader />;
  
  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />;
}

export default AdminRoute;
