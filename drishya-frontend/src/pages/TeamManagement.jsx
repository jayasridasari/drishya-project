import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/formatters';

function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchTeams();
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

      {/* Team Details Modal */}
      {selectedTeam && (
        <Modal 
          visible={!!selectedTeam} 
          title={selectedTeam.team.name} 
          onClose={() => setSelectedTeam(null)}
        >
          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              {selectedTeam.team.description || 'No description'}
            </p>
          </div>
          
          <div>
            <h4 style={{ marginBottom: '16px', fontSize: '16px' }}>
              Team Members ({selectedTeam.members.length})
            </h4>
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
                    <span className="badge" style={{ 
                      background: member.role === 'admin' ? 'var(--primary)' : 'var(--text-light)',
                      color: 'white'
                    }}>
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default TeamManagement;
