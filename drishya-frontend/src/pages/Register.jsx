import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { setAccessToken } from '../services/api';

// Validation schema matching backend requirements
const registerSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  role: yup
    .string()
    .oneOf(['admin', 'member'], 'Role must be admin or member')
    .required('Role is required'),
});

function Register() {
  const navigate = useNavigate();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'member' // Default to member
    }
  });

  const onSubmit = async (formData) => {
    try {
      // API call matches backend: POST /api/auth/register
      // Backend expects: { email, password, role }
      // Backend returns: { user: { id, name, email, role }, accessToken, refreshToken }
      const response = await api.post('/api/auth/register', formData);
      
      const { user, accessToken, refreshToken } = response.data;
      
      // Store authentication data
      setAccessToken(accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success(`Welcome ${user.name}! Registration successful.`);
      navigate('/');
      
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response) {
        // Backend returned an error
        const errorData = error.response.data;
        
        // Handle validation errors from express-validator
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
          toast.error('Registration failed. Please try again.');
        }
      } else if (error.request) {
        toast.error('Cannot connect to server. Please check if the backend is running on port 5000.');
      } else {
        toast.error(`Registration failed: ${error.message}`);
      }
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        <h2>Register for TaskFlow</h2>
        
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
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
          />
          {errors.password && (
            <span className="error">{errors.password.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="role">Role *</label>
          <select id="role" {...register('role')}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && (
            <span className="error">{errors.role.message}</span>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="btn-primary"
        >
          {isSubmitting ? 'Creating Account...' : 'Register'}
        </button>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
