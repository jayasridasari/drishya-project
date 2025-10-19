// pages/Dashboard.jsx
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, Tooltip } from 'recharts';
import { useEffect, useState } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/api/dashboard/stats').then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <Loader />;

  const priorityColors = { Low: '#10B981', Medium: '#F59E0B', High: '#EF4444' };

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <StatCard title="Total Tasks" value={stats.total} />
        <StatCard title="Overdue" value={stats.overdue} color="red" />
        <StatCard title="Due This Week" value={stats.dueThisWeek} color="orange" />
      </div>

      <div className="charts">
        <div className="chart-card">
          <h3>Task Priority Distribution</h3>
          <PieChart width={300} height={300}>
            <Pie data={stats.byPriority} dataKey="count" nameKey="priority">
              {stats.byPriority.map((entry) => (
                <Cell key={entry.priority} fill={priorityColors[entry.priority]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        <div className="chart-card">
          <h3>Tasks by Status</h3>
          <BarChart width={400} height={300} data={stats.byStatus}>
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3B82F6" />
          </BarChart>
        </div>
      </div>
    </div>
  );
};
