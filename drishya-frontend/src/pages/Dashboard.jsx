import { useState, useEffect } from 'react';
import api from '../services/api';
import PriorityChart from '../components/charts/PriorityChart';
import TaskCompletionChart from '../components/charts/TaskCompletionChart';

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/api/dashboard/stats').then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      <div>Total Tasks: {stats.total}</div>
      <div>Overdue: {stats.overdue}</div>
      <div>Due This Week: {stats.dueThisWeek}</div>
      <PriorityChart data={stats.byPriority} />
      <TaskCompletionChart data={stats.byStatus} />
    </div>
  );
}

export default Dashboard;
