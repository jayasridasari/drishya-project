import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerSchema } from '../utils/validation';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { setAccessToken } from '../services/api';

function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(registerSchema) });
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/api/auth/register', data);
      setAccessToken(res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      toast.success('Registered successfully');
      navigate('/');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Registration failed');
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Register</h2>
      <input {...register('email')} type="email" placeholder="Email" />
      <span>{errors.email?.message}</span>
      <input {...register('password')} type="password" placeholder="Password" />
      <span>{errors.password?.message}</span>
      <select {...register('role')}>
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </select>
      <span>{errors.role?.message}</span>
      <button type="submit">Register</button>
    </form>
  );
}
export default Register;
