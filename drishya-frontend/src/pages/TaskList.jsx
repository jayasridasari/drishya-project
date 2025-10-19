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
  const [pagination, setPagination] = useState({ 
    page: 1, 
    limit: 50, 
    total: 0,
    totalPages: 1
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, [filters, pagination.page]);

  const fetchTasks = async () => {
    console.log('=== FETCHING TASKS ===');
    console.log('Filters:', filters);
    console.log('Page:', pagination.page);
    
    try {
      setLoading(true);
      
      // Build query params - only add non-empty values
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }
      if (filters.priority) {
        params.priority = filters.priority;
      }
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.assignee) {
        params.assignee = filters.assignee;
      }

      console.log('API params:', params);
      console.log('Calling GET /api/tasks/search');
      
      const { data } = await api.get('/api/tasks/search', { params });
      
      console.log('Tasks response:', data);
      console.log('Tasks count:', data.tasks?.length || 0);
      
      setTasks(data.tasks || []);
      
      if (data.pagination) {
        setPagination(prev => ({ 
          ...prev, 
          total: data.pagination.total || 0, 
          totalPages: data.pagination.totalPages || 1
        }));
      }
      
    } catch (error) {
      console.error('=== TASK FETCH ERROR ===');
      console.error('Error:', error);
      console.error('Response:', error.response?.data);
      
      toast.error('Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = () => {
    console.log('✅ Task created, refreshing list...');
    setShowCreateModal(false);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchTasks();
  };

  const handleFilterChange = (newFilters) => {
    console.log('Filters changed:', newFilters);
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleTaskClick = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  return (
    <div className="task-list-page">
      <div className="header">
        <div>
          <h2>All Tasks</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {loading ? 'Loading...' : `${pagination.total} total task${pagination.total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          + Add Task
        </button>
      </div>

      <TaskFilters filters={filters} onFilterChange={handleFilterChange} />

      {loading && tasks.length === 0 ? (
        <Loader />
      ) : (
        <>
          <div className="tasks-grid">
            {tasks.length === 0 ? (
              <div className="empty-state">
                <h3>No tasks found</h3>
                <p>
                  {Object.values(filters).some(f => f) 
                    ? 'Try adjusting your filters or create a new task' 
                    : 'Create your first task to get started'}
                </p>
                {!Object.values(filters).some(f => f) && (
                  <button 
                    onClick={() => setShowCreateModal(true)} 
                    className="btn-primary"
                    style={{ marginTop: '16px' }}
                  >
                    + Create Task
                  </button>
                )}
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
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button 
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next →
              </button>
            </div>
          )}
        </>
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
