import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import { toast } from 'react-toastify';

function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data } = await api.get('/api/teams');
      setTeams(data.teams);
    } catch (error) {
      toast.error('Failed to fetch teams');
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/teams', formData);
      toast.success('Team created');
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
      fetchTeams();
    } catch (error) {
      toast.error('Failed to create team');
    }
  };

  const viewTeamDetails = async (teamId) => {
    try {
      const { data } = await api.get(`/api/teams/${teamId}`);
      setSelectedTeam(data);
    } catch (error) {
      toast.error('Failed to fetch team details');
    }
  };

  return (
    <div className="team-management-page">
      <div className="header">
        <h2>Team Management</h2>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          + Create Team
        </button>
      </div>

      <div className="teams-grid">
        {teams.map(team => (
          <div key={team.id} className="team-card" onClick={() => viewTeamDetails(team.id)}>
            <h3>{team.name}</h3>
            <p>{team.description}</p>
            <small>Created: {new Date(team.created_at).toLocaleDateString()}</small>
          </div>
        ))}
      </div>

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
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
            />
          </div>
          <button type="submit" className="btn-primary">Create Team</button>
        </form>
      </Modal>

      {selectedTeam && (
        <Modal 
          visible={!!selectedTeam} 
          title={selectedTeam.team.name} 
          onClose={() => setSelectedTeam(null)}
        >
          <div>
            <h4>Team Members</h4>
            {selectedTeam.members.map(member => (
              <div key={member.id} className="member-item">
                {member.name} - {member.email}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default TeamManagement;
