import { useState, useEffect } from 'react';
import api from '../services/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/tasks');
      setTasks(data.tasks);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    const { data } = await api.post('/api/tasks', taskData);
    fetchTasks();
    return data;
  };

  const updateTask = async (id, taskData) => {
    const { data } = await api.put(`/api/tasks/${id}`, taskData);
    fetchTasks();
    return data;
  };

  const deleteTask = async (id) => {
    await api.delete(`/api/tasks/${id}`);
    fetchTasks();
  };

  return { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask };
};
