import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/formatters';

function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/teams');
      setTeams(data.teams);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      toast.error('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/api/users');
      setUsers(data.users || data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Team name is required');
      return;
    }

    try {
      await api.post('/api/teams', formData);
      toast.success('Team created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
      fetchTeams();
    } catch (error) {
      console.error('Failed to create team:', error);
      toast.error(error.response?.data?.error || 'Failed to create team');
    }
  };

  const viewTeamDetails = async (teamId) => {
    try {
      const { data } = await api.get(`/api/teams/${teamId}`);
      setSelectedTeam(data);
    } catch (error) {
      console.error('Failed to fetch team details:', error);
      toast.error('Failed to fetch team details');
    }
  };

  // FIXED: Check if selectedTeam exists before using it
  const handleAddMember = async (e) => {
    e.preventDefault();
    
    if (!selectedTeam) {
      toast.error('No team selected');
      return;
    }
    
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    try {
      // Use selectedTeam.team.id directly
      await api.post(`/api/teams/${selectedTeam.team.id}/members`, {
        userId: selectedUserId
      });
      toast.success('Member added successfully');
      setShowAddMemberModal(false);
      setSelectedUserId('');
      // Refresh team details
      await viewTeamDetails(selectedTeam.team.id);
    } catch (error) {
      console.error('Failed to add member:', error);
      toast.error(error.response?.data?.error || 'Failed to add member');
    }
  };

  // FIXED: Check if selectedTeam exists
  const handleRemoveMember = async (memberId) => {
    if (!selectedTeam) {
      toast.error('No team selected');
      return;
    }

    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      await api.delete(`/api/teams/${selectedTeam.team.id}/members/${memberId}`);
      toast.success('Member removed successfully');
      // Refresh team details
      await viewTeamDetails(selectedTeam.team.id);
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error(error.response?.data?.error || 'Failed to remove member');
    }
  };

  const getAvailableUsers = () => {
    if (!selectedTeam) return users;
    const memberIds = selectedTeam.members.map(m => m.id);
    return users.filter(user => !memberIds.includes(user.id));
  };

  if (loading) return <Loader />;

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div className="header">
        <div>
          <h2>Team Management</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Manage teams and team members
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          + Create Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="empty-state">
          <h3>No teams yet</h3>
          <p>Create your first team to get started</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {teams.map(team => (
            <div 
              key={team.id} 
              className="card" 
              onClick={() => viewTeamDetails(team.id)}
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--primary)' }}>
                {team.name}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', minHeight: '40px' }}>
                {team.description || 'No description'}
              </p>
              <div style={{ 
                fontSize: '12px', 
                color: 'var(--text-light)',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-color)'
              }}>
                Created {formatDate(team.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal 
        visible={showCreateModal} 
        title="Create New Team" 
        onClose={() => setShowCreateModal(false)}
      >
        <form onSubmit={handleCreateTeam}>
          <div className="form-group">
            <label>Team Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Engineering Team"
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What does this team work on?"
              rows="3"
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Create Team
          </button>
        </form>
      </Modal>

      {/* Team Details Modal - Keep this open while Add Member modal is shown */}
      {selectedTeam && (
        <Modal 
          visible={!!selectedTeam && !showAddMemberModal} 
          title={selectedTeam.team.name} 
          onClose={() => setSelectedTeam(null)}
        >
          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              {selectedTeam.team.description || 'No description'}
            </p>
          </div>
          
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h4 style={{ fontSize: '16px', margin: 0 }}>
                Team Members ({selectedTeam.members.length})
              </h4>
              <button 
                onClick={() => setShowAddMemberModal(true)}
                className="btn-primary"
                style={{ padding: '6px 12px', fontSize: '13px' }}
              >
                + Add Member
              </button>
            </div>
            
            {selectedTeam.members.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No members yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedTeam.members.map(member => (
                  <div 
                    key={member.id} 
                    style={{ 
                      padding: '12px',
                      background: 'var(--bg-primary)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{member.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {member.email}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge" style={{ 
                        background: member.role === 'admin' ? 'var(--primary)' : 'var(--text-light)',
                        color: 'white'
                      }}>
                        {member.role}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMember(member.id);
                        }}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 500
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Add Member Modal - Shows instead of Team Details */}
      {selectedTeam && (
        <Modal 
          visible={showAddMemberModal} 
          title={`Add Member to ${selectedTeam.team.name}`}
          onClose={() => {
            setShowAddMemberModal(false);
            setSelectedUserId('');
          }}
        >
          <form onSubmit={handleAddMember}>
            <div className="form-group">
              <label>Select User *</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px'
                }}
              >
                <option value="">Choose a user...</option>
                {getAvailableUsers().map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'white',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                Add Member
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default TeamManagement;
