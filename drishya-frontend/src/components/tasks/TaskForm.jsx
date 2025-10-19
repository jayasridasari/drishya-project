import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { taskSchema } from '../../utils/validation';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

function TaskForm({ task = null, onSuccess }) {
  const isEdit = !!task;
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(taskSchema),
    defaultValues: task || {
      title: '',
      description: '',
      status: 'Todo',
      priority: 'Medium',
      due_date: '',
      assignee_id: '',
      team_id: ''
    }
  });

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/api/users');
      setUsers(data.users);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const fetchTeams = async () => {
    try {
      const { data } = await api.get('/api/teams');
      setTeams(data.teams);
    } catch (error) {
      console.error('Failed to fetch teams');
    }
  };

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await api.put(`/api/tasks/${task.id}`, data);
      } else {
        await api.post('/api/tasks', data);
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save task');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="task-form">
      <div className="form-group">
        <label>Title *</label>
        <input {...register('title')} type="text" placeholder="Task title" />
        {errors.title && <span className="error">{errors.title.message}</span>}
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea {...register('description')} rows="4" placeholder="Task description" />
        {errors.description && <span className="error">{errors.description.message}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Status *</label>
          <select {...register('status')}>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          {errors.status && <span className="error">{errors.status.message}</span>}
        </div>

        <div className="form-group">
          <label>Priority *</label>
          <select {...register('priority')}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          {errors.priority && <span className="error">{errors.priority.message}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Due Date</label>
          <input {...register('due_date')} type="date" />
          {errors.due_date && <span className="error">{errors.due_date.message}</span>}
        </div>

        <div className="form-group">
          <label>Assignee</label>
          <select {...register('assignee_id')}>
            <option value="">Unassigned</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Team</label>
        <select {...register('team_id')}>
          <option value="">No team</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
