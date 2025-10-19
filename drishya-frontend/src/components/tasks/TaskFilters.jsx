import { useState } from 'react';

function TaskFilters({ filters, onFilterChange }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
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
        placeholder="🔍 Search tasks..."
        value={localFilters.search}
        onChange={(e) => handleChange('search', e.target.value)}
        className="search-input"
      />

      <select 
        value={localFilters.priority} 
        onChange={(e) => handleChange('priority', e.target.value)}
        className="btn-secondary"
      >
        <option value="">All Priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>

      <select 
        value={localFilters.status} 
        onChange={(e) => handleChange('status', e.target.value)}
        className="btn-secondary"
      >
        <option value="">All Statuses</option>
        <option value="Todo">Todo</option>
        <option value="In Progress">In Progress</option>
        <option value="Done">Done</option>
      </select>

      <button onClick={handleReset} className="btn-secondary">
        Reset
      </button>
    </div>
  );
}

export default TaskFilters;
