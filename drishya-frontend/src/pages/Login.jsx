import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { setAccessToken } from '../services/api';

const loginSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required'),
});

function Login() {
  const navigate = useNavigate();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (formData) => {
    try {
      // API call matches backend: POST /api/auth/login
      // Backend expects: { email, password }
      // Backend returns: { user: { id, name, email, role }, accessToken, refreshToken }
      const response = await api.post('/api/auth/login', formData);
      
      const { user, accessToken, refreshToken } = response.data;
      
      // Store authentication data
      setAccessToken(accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/');
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        const errorData = error.response.data;
        
        // Handle validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach(err => {
            toast.error(`${err.param}: ${err.msg}`);
          });
        } 
        // Handle single error message
        else if (errorData.error) {
          toast.error(errorData.error);
        } 
        else {
          toast.error('Login failed. Please check your credentials.');
        }
      } else if (error.request) {
        toast.error('Cannot connect to server. Please check if the backend is running on port 5000.');
      } else {
        toast.error(`Login failed: ${error.message}`);
      }
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        <h2>Login to TaskFlow</h2>
        
        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            placeholder="your.email@example.com"
            autoComplete="email"
          />
          {errors.email && (
            <span className="error">{errors.email.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            id="password"
            type="password"
            {...register('password')}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          {errors.password && (
            <span className="error">{errors.password.message}</span>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="btn-primary"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
