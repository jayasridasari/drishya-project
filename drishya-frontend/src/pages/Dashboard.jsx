import { useState, useEffect } from 'react';
import api from '../services/api';
import PriorityChart from '../components/charts/PriorityChart';
import TaskCompletionChart from '../components/charts/TaskCompletionChart';
import Loader from '../components/common/Loader';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <h2>Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card danger">
          <h3>Overdue</h3>
          <p className="stat-number">{stats.overdue}</p>
        </div>
        <div className="stat-card warning">
          <h3>Due This Week</h3>
          <p className="stat-number">{stats.dueThisWeek}</p>
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
            <h3>Tasks by Status</h3>
            <TaskCompletionChart data={stats.byStatus} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
