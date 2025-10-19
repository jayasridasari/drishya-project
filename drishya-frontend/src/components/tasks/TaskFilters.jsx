import { useState, useEffect } from 'react';
import api from '../../services/api';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function TaskFilters({ filters, onFilterChange }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [users, setUsers] = useState([]);
  const debouncedSearch = useDebounce(localFilters.search, 300);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFilterChange({ ...localFilters, search: debouncedSearch });
    }
  }, [debouncedSearch]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/api/users');
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    }
  };

  const handleChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    if (field !== 'search') {
      onFilterChange(newFilters);
    }
  };

  const handleReset = () => {
    const emptyFilters = { search: '', priority: '', status: '', assignee: '' };
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="task-filters">
      <input
        type="text"
        placeholder="Search tasks..."
        value={localFilters.search}
        onChange={(e) => handleChange('search', e.target.value)}
        className="search-input"
        aria-label="Search tasks"
      />

      <select 
        value={localFilters.priority} 
        onChange={(e) => handleChange('priority', e.target.value)}
        aria-label="Filter by priority"
      >
        <option value="">All Priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>

      <select 
        value={localFilters.status} 
        onChange={(e) => handleChange('status', e.target.value)}
        aria-label="Filter by status"
      >
        <option value="">All Statuses</option>
        <option value="Todo">Todo</option>
        <option value="In Progress">In Progress</option>
        <option value="Done">Done</option>
      </select>

      {/* NEW: Assignee Filter */}
      <select 
        value={localFilters.assignee} 
        onChange={(e) => handleChange('assignee', e.target.value)}
        aria-label="Filter by assignee"
      >
        <option value="">All Assignees</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>{user.name}</option>
        ))}
      </select>

      <button onClick={handleReset} className="btn-secondary">
        Reset
      </button>
    </div>
  );
}

export default TaskFilters;
