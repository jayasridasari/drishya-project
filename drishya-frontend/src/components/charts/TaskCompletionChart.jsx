import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function TaskCompletionChart({ data }) {
  return (
    <BarChart width={350} height={250} data={data}>
      <XAxis dataKey="status" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="count" fill="#3273DC" />
    </BarChart>
  );
}
