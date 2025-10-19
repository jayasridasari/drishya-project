export default function TaskCard({ task }) {
  return (
    <div className="task-card">
      <h4>{task.title}</h4>
      <div>{task.description}</div>
      <div>Priority: {task.priority}</div>
      <div>Status: {task.status}</div>
      <div>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</div>
    </div>
  );
}
