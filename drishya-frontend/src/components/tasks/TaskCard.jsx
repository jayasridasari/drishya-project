import { formatDate } from '../../utils/formatters';

export default function TaskCard({ task }) {
  const getPriorityClass = (priority) => {
    return `badge priority-${priority.toLowerCase()}`;
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'Todo': 'todo',
      'In Progress': 'in-progress',
      'Done': 'done'
    };
    return `badge status-${statusMap[status] || 'todo'}`;
  };

  return (
    <div className="task-card">
      <div className="task-card-header">
        <h4>{task.title}</h4>
        <span className={getPriorityClass(task.priority)}>{task.priority}</span>
      </div>
      
      {task.description && (
        <p>{task.description.length > 100 ? task.description.substring(0, 100) + '...' : task.description}</p>
      )}
      
      <div className="task-card-footer">
        <span className={getStatusClass(task.status)}>{task.status}</span>
        {task.due_date && (
          <span>Due: {formatDate(task.due_date)}</span>
        )}
      </div>
    </div>
  );
}
