import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
function TaskForm({ task = null, onSuccess }) {
  const isEdit = !!task;
  const { isAdmin } = useUser(); // ✅ GET ADMIN STATUS
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Safe date formatter
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Due date validator
  const validateDueDate = (date) => {
    if (!date) return true;
    const selected = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    return selected >= today;
  };

  const getDefaultValues = () => {
    if (!task) {
      return {
        title: '',
        description: '',
        status: 'Todo',
        priority: 'Medium',
        due_date: '',
        assignee_id: '',
        team_id: ''
      };
    }
    return {
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'Todo',
      priority: task.priority || 'Medium',
      due_date: formatDateForInput(task.due_date),
      assignee_id: task.assignee_id || '',
      team_id: task.team_id || ''
    };
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: getDefaultValues()
  });

  // Reset form when task changes
  useEffect(() => {
    reset(getDefaultValues());
  }, [task]);

  // Fetch users and teams
  useEffect(() => {
    fetchUsers();
    if (isAdmin) { // ✅ ONLY FETCH TEAMS IF ADMIN
      fetchTeams();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/api/users');
      const userList = data.users || data || [];
      setUsers(Array.isArray(userList) ? userList : []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data } = await api.get('/api/teams');
      const teamList = data.teams || data || [];
      setTeams(Array.isArray(teamList) ? teamList : []);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      setTeams([]);
    }
  };

  const onSubmit = async (formData) => {
    console.log('=== TASK FORM SUBMISSION ===');
    console.log('Form data:', formData);
    console.log('Is Admin:', isAdmin);
    // Validate due date
    if (formData.due_date && !validateDueDate(formData.due_date)) {
      toast.error('Due date cannot be in the past');
      return;
    }
    
    setSubmitting(true);

    try {
      // Build payload with proper null handling
      const payload = {
        title: formData.title.trim(),
        description: formData.description ? formData.description.trim() : '',
        status: formData.status,
        priority: formData.priority
      };

      // Only add optional fields if they have values
      if (formData.due_date) {
        payload.due_date = formData.due_date;
      }
      
      if (formData.assignee_id && formData.assignee_id !== '') {
        payload.assignee_id = formData.assignee_id;
      }
      
      if (isAdmin) {
        if (isEdit) {
          // On edit: explicitly set or clear
          payload.team_id = formData.team_id === '' ? null : formData.team_id;
        } else {
          // On create: only include if non-empty
          if (formData.team_id && formData.team_id !== '') {
            payload.team_id = formData.team_id;
          }
        }
      }

      console.log('Sending payload:', payload);

      let response;
      if (isEdit) {
        response = await api.put(`/api/tasks/${task.id}`, payload);
        toast.success('Task updated successfully! ✅');
      } else {
        response = await api.post('/api/tasks', payload);
        toast.success('Task created successfully! ✅');
      }
      
      console.log('Success:', response.data);
      reset(getDefaultValues());
      onSuccess();
      
    } catch (error) {
      console.error('Task save error:', error);
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach(err => {
          toast.error(`${err.param}: ${err.msg}`);
        });
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
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
          {...register('title', { 
            required: 'Title is required',
            minLength: { value: 3, message: 'Title must be at least 3 characters' }
          })} 
          type="text" 
          placeholder="Enter task title"
          disabled={submitting}
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
          disabled={submitting}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status">Status *</label>
          <select id="status" {...register('status')} disabled={submitting}>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority *</label>
          <select 
            id="priority" 
            {...register('priority', { required: 'Priority is required' })}
            disabled={submitting}
          >
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
            disabled={submitting}
          />
          <small style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
            Optional - leave empty for no due date
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="assignee_id">Assignee</label>
          <select id="assignee_id" {...register('assignee_id')} disabled={submitting}>
            <option value="">Unassigned</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isAdmin && (
        <div className="form-group">
          <label htmlFor="team_id">Team</label>
          <select id="team_id" {...register('team_id')} disabled={submitting}>
            <option value="">No team</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      )}

      <button 
        type="submit" 
        disabled={submitting} 
        className="btn-primary" 
        style={{ width: '100%' }}
      >
        {submitting ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Task' : 'Create Task')}
      </button>
    </form>
  );
}

export default TaskForm;
