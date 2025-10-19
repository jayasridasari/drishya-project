import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import TaskCard from '../components/tasks/TaskCard';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    status: '',
    assignee: ''
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, [filters, pagination.page]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      const { data } = await api.get('/api/tasks/search', { params });
      setTasks(data.tasks);
      setPagination(prev => ({ 
        ...prev, 
        total: data.pagination.total, 
        totalPages: data.pagination.totalPages 
      }));
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = () => {
    setShowCreateModal(false);
    fetchTasks();
    toast.success('Task created successfully');
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleTaskClick = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  if (loading && tasks.length === 0) return <Loader />;

  return (
    <div className="task-list-page">
      <div className="header">
        <div>
          <h2>All Tasks</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {pagination.total} total tasks
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          + Add Task
        </button>
      </div>

      <TaskFilters filters={filters} onFilterChange={handleFilterChange} />

      <div className="tasks-grid">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks found</h3>
            <p>Try adjusting your filters or create a new task</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} onClick={() => handleTaskClick(task.id)}>
              <TaskCard task={task} />
            </div>
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            ← Previous
          </button>
          <span style={{ color: 'var(--text-secondary)' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button 
            disabled={pagination.page === pagination.totalPages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next →
          </button>
        </div>
      )}

      <Modal 
        visible={showCreateModal} 
        title="Create New Task" 
        onClose={() => setShowCreateModal(false)}
      >
        <TaskForm onSuccess={handleTaskCreated} />
      </Modal>
    </div>
  );
}

export default TaskList;
