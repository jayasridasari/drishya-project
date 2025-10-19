import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import CommentSection from '../components/tasks/CommentSection';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';
import { formatDate, formatRelativeTime } from '../utils/formatters';

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
      console.error('Failed to fetch task:', error);
      toast.error('Failed to fetch task');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await api.delete(`/api/tasks/${id}`);
      toast.success('Task deleted successfully');
      navigate('/tasks');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleTaskUpdated = () => {
    setShowEditModal(false);
    fetchTask();
    toast.success('Task updated successfully');
  };

  if (loading) return <Loader />;
  if (!task) return <div>Task not found</div>;

  const getPriorityColor = (priority) => {
    const colors = {
      Low: 'var(--success)',
      Medium: 'var(--warning)',
      High: 'var(--danger)'
    };
    return colors[priority] || 'var(--text-secondary)';
  };

  const getStatusColor = (status) => {
    const colors = {
      Todo: 'var(--info)',
      'In Progress': 'var(--warning)',
      Done: 'var(--success)'
    };
    return colors[status] || 'var(--text-secondary)';
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => navigate('/tasks')} className="btn-secondary" style={{ marginBottom: '16px' }}>
          ← Back to Tasks
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{task.title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Created {formatRelativeTime(task.created_at)}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowEditModal(true)} className="btn-primary">
              Edit
            </button>
            <button onClick={handleDelete} className="btn-danger">
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '24px',
          marginBottom: '24px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
              STATUS
            </div>
            <span style={{ 
              display: 'inline-block',
              padding: '6px 12px',
              background: getStatusColor(task.status) + '20',
              color: getStatusColor(task.status),
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 600
            }}>
              {task.status}
            </span>
          </div>
          
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
              PRIORITY
            </div>
            <span style={{ 
              display: 'inline-block',
              padding: '6px 12px',
              background: getPriorityColor(task.priority) + '20',
              color: getPriorityColor(task.priority),
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 600
            }}>
              {task.priority}
            </span>
          </div>
          
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
              DUE DATE
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
              {task.due_date ? formatDate(task.due_date) : 'No due date'}
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
              ASSIGNEE
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
              {task.assignee_id || 'Unassigned'}
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: 600 }}>Description</h3>
          <p style={{ color: 'var(--text-primary)', lineHeight: '1.7' }}>
            {task.description || 'No description provided'}
          </p>
        </div>

        <CommentSection taskId={id} />
      </div>

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
