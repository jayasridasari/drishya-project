import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user && user.role === 'admin';

  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>📊</span> Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/kanban" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>📋</span> Progress
          </NavLink>
        </li>
        <li>
          <NavLink to="/tasks" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>✅</span> Tasks
          </NavLink>
        </li>
        
        {isAdmin && (
          <>
            <li style={{ margin: '20px 24px 10px', color: 'var(--text-light)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Admin
            </li>
            <li>
              <NavLink to="/teams" className={({ isActive }) => isActive ? 'active' : ''}>
                <span>👥</span> Teams
              </NavLink>
            </li>
            <li>
              <NavLink to="/users" className={({ isActive }) => isActive ? 'active' : ''}>
                <span>👤</span> Users
              </NavLink>
            </li>
          </>
        )}
        
        <li style={{ margin: '20px 24px 10px', color: 'var(--text-light)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Account
        </li>
        <li>
          <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>⚙️</span> Profile
          </NavLink>
        </li>
      </ul>
    </aside>
  );
}
