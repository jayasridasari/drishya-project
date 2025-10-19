import { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/formatters';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/users');
      setUsers(data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/api/users/${userId}`, { is_active: !currentStatus });
      toast.success('User status updated');
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user');
    }
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      await api.put(`/api/users/${userId}`, { role: newRole });
      toast.success('User role updated');
      fetchUsers();
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error('Failed to update role');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/api/users/${userId}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ maxWidth: '1400px' }}>
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage user accounts, roles, and permissions</p>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)' }}>NAME</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)' }}>EMAIL</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)' }}>ROLE</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)' }}>STATUS</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)' }}>CREATED</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{user.name}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td style={{ padding: '16px' }}>
                    <select
                      value={user.role}
                      onChange={(e) => changeUserRole(user.id, e.target.value)}
                      style={{ 
                        padding: '6px 10px', 
                        borderRadius: 'var(--radius-md)', 
                        border: '1px solid var(--border-color)',
                        fontSize: '14px'
                      }}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: user.is_active ? '#d1fae5' : '#fee2e2',
                      color: user.is_active ? '#065f46' : '#991b1b'
                    }}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {formatDate(user.created_at)}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                        style={{ 
                          padding: '6px 12px',
                          fontSize: '13px',
                          border: '1px solid var(--border-color)',
                          background: 'white',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer'
                        }}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => deleteUser(user.id)}
                        style={{ 
                          padding: '6px 12px',
                          fontSize: '13px',
                          border: 'none',
                          background: 'var(--danger)',
                          color: 'white',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
