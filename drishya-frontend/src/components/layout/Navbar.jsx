import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { setAccessToken } from '../../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        // Call backend logout endpoint
        await api.post('/api/auth/logout', { refreshToken });
      }
      
      // Clear local storage
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setAccessToken(null);
      
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if API call fails
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setAccessToken(null);
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h3>TaskFlow</h3>
      </div>
      
      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/kanban">Kanban</Link>
        <Link to="/tasks">Tasks</Link>
        
        {user && user.role === 'admin' && (
          <>
            <Link to="/teams">Teams</Link>
            <Link to="/users">Users</Link>
          </>
        )}
      </div>

      <div className="nav-user">
        {user && (
          <>
            <Link to="/profile" className="user-profile">
              {user.name} ({user.role})
            </Link>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
