import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import CommentSection from '../components/tasks/CommentSection';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/formatters';

function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/tasks/${id}`);
      setTask(data.task);
    } catch (error) {
      toast.error('Failed to fetch task');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/api/tasks/${id}`);
        toast.success('Task deleted');
        navigate('/tasks');
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleTaskUpdated = () => {
    setShowEditModal(false);
    fetchTask();
    toast.success('Task updated successfully');
  };

  if (loading) return <Loader />;
  if (!task) return <div>Task not found</div>;

  return (
    <div className="task-details-page">
      <div className="task-header">
        <h2>{task.title}</h2>
        <div className="actions">
          <button onClick={() => setShowEditModal(true)} className="btn-secondary">
            Edit
          </button>
          <button onClick={handleDelete} className="btn-danger">
            Delete
          </button>
        </div>
      </div>

      <div className="task-info">
        <div className="info-item">
          <label>Status:</label>
          <span className={`status-badge ${task.status.toLowerCase()}`}>
            {task.status}
          </span>
        </div>
        <div className="info-item">
          <label>Priority:</label>
          <span className={`priority-badge ${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
        </div>
        <div className="info-item">
          <label>Due Date:</label>
          <span>{task.due_date ? formatDate(task.due_date) : 'No due date'}</span>
        </div>
        <div className="info-item">
          <label>Assignee:</label>
          <span>{task.assignee_id || 'Unassigned'}</span>
        </div>
        <div className="info-item">
          <label>Created:</label>
          <span>{formatDate(task.created_at)}</span>
        </div>
      </div>

      <div className="task-description">
        <h3>Description</h3>
        <p>{task.description || 'No description provided'}</p>
      </div>

      <CommentSection taskId={id} />

      <Modal 
        visible={showEditModal} 
        title="Edit Task" 
        onClose={() => setShowEditModal(false)}
      >
        <TaskForm task={task} onSuccess={handleTaskUpdated} />
      </Modal>
    </div>
  );
}

export default TaskDetails;
