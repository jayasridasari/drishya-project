import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { setAccessToken } from '../services/api';

const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

function Login() {
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (formData) => {
    try {
      const response = await api.post('/api/auth/login', formData);
      const { user, accessToken, refreshToken } = response.data;
      
      setAccessToken(accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/');
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => toast.error(`${err.param}: ${err.msg}`));
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.request) {
        toast.error('Cannot connect to server. Check if backend is running on port 5000.');
      } else {
        toast.error(`Login failed: ${error.message}`);
      }
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to your TaskFlow account</p>
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            {...register('password')}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          {errors.password && <span className="error">{errors.password.message}</span>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%' }}>
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
