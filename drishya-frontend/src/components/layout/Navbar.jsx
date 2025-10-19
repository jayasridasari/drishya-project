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
        await api.post('/api/auth/logout', { refreshToken });
      }
      
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setAccessToken(null);
      
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setAccessToken(null);
      navigate('/login');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h3>TaskFlow</h3>
      </div>
      
      <div className="nav-search">
        <input type="text" placeholder="Search tasks..." />
      </div>

      <div className="nav-user">
        {user && (
          <>
            <Link to="/profile" className="user-profile">
              <div className="user-avatar">{getInitials(user.name)}</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{user.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{user.role}</div>
              </div>
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
