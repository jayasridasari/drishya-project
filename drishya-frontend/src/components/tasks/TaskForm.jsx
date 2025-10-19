import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

function TaskForm({ task = null, onSuccess }) {
  const isEdit = !!task;
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Prepare default values matching backend format
  const defaultValues = task ? {
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'Todo',
    priority: task.priority || 'Medium',
    due_date: task.due_date ? task.due_date.split('T')[0] : '',
    assignee_id: task.assignee_id || '',
    team_id: task.team_id || ''
  } : {
    title: '',
    description: '',
    status: 'Todo',
    priority: 'Medium',
    due_date: '',
    assignee_id: '',
    team_id: ''
  };

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues
  });

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/api/users');
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Non-admin users might not have access
      setUsers([]);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data } = await api.get('/api/teams');
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      setTeams([]);
    }
  };

  const onSubmit = async (formData) => {
    console.log('=== TASK FORM SUBMISSION ===');
    console.log('Form data received:', formData);
    
    setSubmitting(true);

    try {
      // Backend expects:
      // - title (required, non-empty)
      // - priority (required, one of: Low, Medium, High)
      // - description (optional, defaults to empty string)
      // - status (optional, defaults to 'Todo')
      // - due_date (optional, ISO8601 format or null)
      // - assignee_id (optional, UUID or null)
      // - team_id (optional, UUID or null)

      const payload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        status: formData.status,
        priority: formData.priority,
        // CRITICAL: Convert empty string to null, or keep ISO date format
        due_date: formData.due_date ? formData.due_date : null,
        // CRITICAL: Convert empty string to null for UUIDs
        assignee_id: formData.assignee_id || null,
        team_id: formData.team_id || null
      };

      console.log('Payload to send:', payload);

      let response;
      if (isEdit) {
        console.log(`PUT /api/tasks/${task.id}`);
        response = await api.put(`/api/tasks/${task.id}`, payload);
        console.log('Update response:', response.data);
        toast.success('Task updated successfully!');
      } else {
        console.log('POST /api/tasks');
        response = await api.post('/api/tasks', payload);
        console.log('Create response:', response.data);
        toast.success('Task created successfully!');
      }
      
      onSuccess();
    } catch (error) {
      console.error('=== TASK FORM ERROR ===');
      console.error('Error:', error);
      console.error('Response:', error.response);
      console.error('Response data:', error.response?.data);
      
      // Handle express-validator errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach(err => {
          console.error('Validation error:', err);
          toast.error(`${err.param}: ${err.msg}`);
        });
      } 
      // Handle single error message
      else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } 
      // Network errors
      else if (error.request) {
        toast.error('Cannot connect to server. Is your backend running on port 5000?');
      } 
      // Other errors
      else {
        toast.error('Failed to save task. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
      <div className="form-group">
        <label htmlFor="title">Task Title *</label>
        <input 
          id="title"
          {...register('title', { required: 'Title is required' })} 
          type="text" 
          placeholder="Enter task title"
        />
        {errors.title && <span className="error">{errors.title.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea 
          id="description"
          {...register('description')} 
          rows="4" 
          placeholder="Describe the task..."
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status">Status *</label>
          <select id="status" {...register('status')}>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority *</label>
          <select id="priority" {...register('priority', { required: 'Priority is required' })}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          {errors.priority && <span className="error">{errors.priority.message}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="due_date">Due Date</label>
          <input 
            id="due_date"
            {...register('due_date')} 
            type="date"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="form-group">
          <label htmlFor="assignee_id">Assignee</label>
          <select id="assignee_id" {...register('assignee_id')}>
            <option value="">Unassigned</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="team_id">Team (Optional)</label>
        <select id="team_id" {...register('team_id')}>
          <option value="">No team</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
      </div>

      <button 
        type="submit" 
        disabled={submitting} 
        className="btn-primary" 
        style={{ width: '100%', marginTop: '8px' }}
      >
        {submitting ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
      </button>
    </form>
  );
}

export default TaskForm;
