import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PriorityChart from '../components/charts/PriorityChart';
import DeadlineChart from '../components/charts/DeadlineChart';
import Loader from '../components/common/Loader';
import { formatDate } from '../utils/formatters';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const statsRes = await api.get('/api/dashboard/stats');
      setStats(statsRes.data);
      
      const overdueRes = await api.get('/api/tasks/overdue');
      setOverdueTasks(overdueRes.data.overdueTasks || []);
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!stats) return <div>Failed to load dashboard</div>;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Manage your tasks and track progress</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card warning">
          <h3>In Progress</h3>
          <p className="stat-number">
            {stats.byStatus?.find(s => s.status === 'In Progress')?.count || 0}
          </p>
        </div>
        <div className="stat-card success">
          <h3>Completed</h3>
          <p className="stat-number">
            {stats.byStatus?.find(s => s.status === 'Done')?.count || 0}
          </p>
        </div>
        <div className="stat-card danger">
          <h3>Overdue</h3>
          <p className="stat-number">{stats.overdue}</p>
        </div>
      </div>

      {overdueTasks.length > 0 && (
        <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid var(--danger)' }}>
          <h3 style={{ color: 'var(--danger)', marginBottom: '16px' }}>
            ⚠️ Overdue Tasks ({overdueTasks.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {overdueTasks.slice(0, 5).map(task => (
              <div 
                key={task.id} 
                onClick={() => navigate(`/tasks/${task.id}`)}
                style={{ 
                  padding: '12px',
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong>{task.title}</strong>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Due: {formatDate(task.due_date)}
                  </div>
                </div>
                <span className="badge priority-high">{task.priority}</span>
              </div>
            ))}
          </div>
          {overdueTasks.length > 5 && (
            <button 
              onClick={() => navigate('/tasks')} 
              className="btn-secondary"
              style={{ marginTop: '12px', width: '100%' }}
            >
              View All Overdue Tasks
            </button>
          )}
        </div>
      )}

      <div className="charts-container">
        {/* Priority Pie Chart */}
        {stats.byPriority && stats.byPriority.length > 0 && (
          <div className="chart-card">
            <h3>Task Priority Distribution</h3>
            <PriorityChart data={stats.byPriority} />
          </div>
        )}

        {/* Deadline Bar Chart */}
        {stats.deadlines && stats.deadlines.length > 0 && (
          <div className="chart-card">
            <h3>Upcoming Deadlines (Next 14 Days)</h3>
            <DeadlineChart data={stats.deadlines} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
