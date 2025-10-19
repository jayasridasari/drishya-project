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
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      console.log('Fetching task:', id);
      const { data } = await api.get(`/api/tasks/${id}`);
      console.log('Task data:', data);
      setTask(data.task);
    } catch (error) {
      console.error('Failed to fetch task:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to load task');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    setDeleting(true);
    
    try {
      console.log('Deleting task:', id);
      await api.delete(`/api/tasks/${id}`);
      toast.success('Task deleted successfully');
      navigate('/tasks');
    } catch (error) {
      console.error('Failed to delete task:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to delete task');
      setDeleting(false);
    }
  };

  const handleTaskUpdated = () => {
    setShowEditModal(false);
    fetchTask();
  };

  if (loading) return <Loader />;
  if (!task) {
    return (
      <div className="empty-state">
        <h3>Task not found</h3>
        <button onClick={() => navigate('/tasks')} className="btn-primary">
          Back to Tasks
        </button>
      </div>
    );
  }

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
      'Todo': 'var(--info)',
      'In Progress': 'var(--warning)',
      'Done': 'var(--success)'
    };
    return colors[status] || 'var(--text-secondary)';
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <button 
          onClick={() => navigate('/tasks')} 
          className="btn-secondary" 
          style={{ marginBottom: '16px' }}
        >
          ← Back to Tasks
        </button>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h1 style={{ fontSize: '28px', marginBottom: '8px', lineHeight: '1.3' }}>
              {task.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Created {formatRelativeTime(task.created_at)}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
            <button 
              onClick={() => setShowEditModal(true)} 
              className="btn-primary"
              disabled={deleting}
            >
              Edit Task
            </button>
            <button 
              onClick={handleDelete} 
              className="btn-danger"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '24px',
          marginBottom: '32px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div>
            <div style={{ 
              fontSize: '11px', 
              color: 'var(--text-secondary)', 
              marginBottom: '8px', 
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Status
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
            <div style={{ 
              fontSize: '11px', 
              color: 'var(--text-secondary)', 
              marginBottom: '8px', 
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Priority
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
            <div style={{ 
              fontSize: '11px', 
              color: 'var(--text-secondary)', 
              marginBottom: '8px', 
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Due Date
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
              {task.due_date ? formatDate(task.due_date) : 'No due date'}
            </div>
          </div>
          
          <div>
            <div style={{ 
              fontSize: '11px', 
              color: 'var(--text-secondary)', 
              marginBottom: '8px', 
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Assignee
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
              {task.assignee_id || 'Unassigned'}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ 
            fontSize: '16px', 
            marginBottom: '12px', 
            fontWeight: 600,
            color: 'var(--text-primary)'
          }}>
            Description
          </h3>
          <p style={{ 
            color: 'var(--text-primary)', 
            lineHeight: '1.7',
            whiteSpace: 'pre-wrap'
          }}>
            {task.description || 'No description provided.'}
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
