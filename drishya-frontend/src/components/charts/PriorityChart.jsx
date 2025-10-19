import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PriorityChart({ data }) {
  const colors = {
    Low: '#10b981',
    Medium: '#f59e0b',
    High: '#ef4444'
  };

  const chartData = data.map(item => ({
    name: item.priority,
    value: parseInt(item.count)
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[entry.name] || '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
