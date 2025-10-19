import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerSchema } from '../utils/validation';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { setAccessToken } from '../services/api';

function Register() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(registerSchema)
  });
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/api/auth/register', data);
      setAccessToken(res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Registration successful!');
      navigate('/');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        <h2>Register for TaskFlow</h2>
        
        <div className="form-group">
          <label>Email</label>
          <input {...register('email')} type="email" placeholder="Enter your email" />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label>Password</label>
          <input {...register('password')} type="password" placeholder="Choose a password (min 8 characters)" />
          {errors.password && <span className="error">{errors.password.message}</span>}
        </div>

        <div className="form-group">
          <label>Role</label>
          <select {...register('role')}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && <span className="error">{errors.role.message}</span>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
