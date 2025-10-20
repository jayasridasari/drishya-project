import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function DeadlineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px', 
        color: 'var(--text-secondary)' 
      }}>
        No upcoming deadlines
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart 
        data={data} 
        margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="date" 
          style={{ fontSize: '12px' }}
          angle={-45}
          textAnchor="end"
        />
        <YAxis 
          allowDecimals={false}
          style={{ fontSize: '12px' }}
          label={{ value: 'Number of Tasks', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '10px'
          }}
          labelStyle={{ fontWeight: 'bold' }}
        />
        <Legend />
        <Bar 
          dataKey="count" 
          fill="#3b82f6" 
          name="Tasks Due"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default DeadlineChart;
