import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '../utils/validation';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { setAccessToken } from '../services/api';

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(loginSchema) });
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/api/auth/login', data);
      setAccessToken(res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      toast.success('Login successful');
      navigate('/');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Login failed');
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Login</h2>
      <input {...register('email')} type="email" placeholder="Email" />
      <span>{errors.email?.message}</span>
      <input {...register('password')} type="password" placeholder="Password" />
      <span>{errors.password?.message}</span>
      <button type="submit">Login</button>
    </form>
  );
}
export default Login;
