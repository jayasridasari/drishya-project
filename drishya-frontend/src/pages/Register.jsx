import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { setAccessToken } from '../services/api';

const registerSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  role: yup.string().oneOf(['admin', 'member']).required('Role is required'),
});

function Register() {
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: { email: '', password: '', role: 'member' }
  });

  const onSubmit = async (formData) => {
    console.log('=== REGISTRATION ATTEMPT ===');
    
    try {
      const response = await api.post('/api/auth/register', formData);
      console.log('Registration response:', response.data);
      
      const { user, accessToken, refreshToken } = response.data;
      
      // CRITICAL: Set access token IMMEDIATELY
      setAccessToken(accessToken);
      
      // Store in localStorage
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('✅ Registration successful');
      
      toast.success(`Welcome ${user.name}! Your account has been created.`);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('=== REGISTRATION ERROR ===');
      console.error('Response:', error.response?.data);
      
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => toast.error(`${err.param}: ${err.msg}`));
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.request) {
        toast.error('Cannot connect to server. Check if backend is running on port 5000.');
      } else {
        toast.error(`Registration failed: ${error.message}`);
      }
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        <h2>Create Account</h2>
        <p className="subtitle">Start managing your tasks efficiently</p>
        
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
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
          />
          {errors.password && <span className="error">{errors.password.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select id="role" {...register('role')}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && <span className="error">{errors.role.message}</span>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%' }}>
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
