import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/formatters';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const { register: registerProfile, handleSubmit: handleProfileSubmit, setValue, formState: { isSubmitting: isProfileSubmitting } } = useForm();
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { isSubmitting: isPasswordSubmitting } } = useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/profile');
      setProfile(data.profile);
      setValue('name', data.profile.name);
      setValue('email', data.profile.email);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const onProfileSubmit = async (data) => {
    try {
      await api.put('/api/profile', data);
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await api.put('/api/profile/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Password updated successfully');
      resetPassword();
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Failed to update password:', error);
      toast.error(error.response?.data?.error || 'Failed to update password');
    }
  };

  if (loading) return <Loader />;
  if (!profile) return <div>Failed to load profile</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '24px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '32px',
            fontWeight: 700
          }}>
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>{profile.name}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{profile.email}</p>
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              {profile.role}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Account Status</div>
            <div style={{ fontWeight: 600 }}>{profile.is_active ? 'Active' : 'Inactive'}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Member Since</div>
            <div style={{ fontWeight: 600 }}>{formatDate(profile.created_at)}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Role</div>
            <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{profile.role}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Update Profile</h3>
        <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
          <div className="form-group">
            <label>Name</label>
            <input {...registerProfile('name')} type="text" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input {...registerProfile('email')} type="email" />
          </div>
          <button type="submit" disabled={isProfileSubmitting} className="btn-primary">
            {isProfileSubmitting ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px' }}>Change Password</h3>
          <button 
            onClick={() => setShowPasswordForm(!showPasswordForm)} 
            className="btn-secondary"
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
            <div className="form-group">
              <label>Current Password</label>
              <input {...registerPassword('currentPassword')} type="password" required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input {...registerPassword('newPassword')} type="password" minLength="8" required />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input {...registerPassword('confirmPassword')} type="password" minLength="8" required />
            </div>
            <button type="submit" disabled={isPasswordSubmitting} className="btn-primary">
              {isPasswordSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;
