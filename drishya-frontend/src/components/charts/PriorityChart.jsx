import { PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function PriorityChart({ data }) {
  const colors = { Low: '#23D160', Medium: '#FFDD57', High: '#FF3860' };
  return (
    <PieChart width={250} height={250}>
      <Pie data={data} dataKey="count" nameKey="priority" outerRadius={80} fill="#8884d8">
        {data.map((entry, idx) => (
          <Cell key={`cell-${idx}`} fill={colors[entry.priority] || '#8884d8'} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
}
