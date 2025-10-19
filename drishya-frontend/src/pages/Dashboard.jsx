import { useState, useEffect } from 'react';
import api from '../services/api';
import PriorityChart from '../components/charts/PriorityChart';
import TaskCompletionChart from '../components/charts/TaskCompletionChart';
import Loader from '../components/common/Loader';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/api/dashboard/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!stats) return <div>Failed to load dashboard</div>;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Project Dashboard</h1>
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

      <div className="charts-container">
        {stats.byPriority && stats.byPriority.length > 0 && (
          <div className="chart-card">
            <h3>Task Priority Distribution</h3>
            <PriorityChart data={stats.byPriority} />
          </div>
        )}

        {stats.byStatus && stats.byStatus.length > 0 && (
          <div className="chart-card">
            <h3>Weekly Task Completion</h3>
            <TaskCompletionChart data={stats.byStatus} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
