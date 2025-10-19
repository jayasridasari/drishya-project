import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { toast } from 'react-toastify';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const { register: registerProfile, handleSubmit: handleProfileSubmit, setValue } = useForm();
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword } = useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/api/profile');
      setProfile(data.profile);
      setValue('name', data.profile.name);
      setValue('email', data.profile.email);
    } catch (error) {
      toast.error('Failed to fetch profile');
    }
  };

  const onProfileSubmit = async (data) => {
    try {
      await api.put('/api/profile', data);
      toast.success('Profile updated');
      fetchProfile();
    } catch (error) {
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
      toast.success('Password updated');
      resetPassword();
      setShowPasswordForm(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update password');
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="profile-page">
      <h2>My Profile</h2>

      <div className="profile-info">
        <p><strong>Role:</strong> {profile.role}</p>
        <p><strong>Account Status:</strong> {profile.is_active ? 'Active' : 'Inactive'}</p>
        <p><strong>Member Since:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
      </div>

      <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="profile-form">
        <h3>Update Profile</h3>
        <div className="form-group">
          <label>Name</label>
          <input {...registerProfile('name')} type="text" />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input {...registerProfile('email')} type="email" />
        </div>
        <button type="submit" className="btn-primary">Update Profile</button>
      </form>

      <div className="password-section">
        <button 
          onClick={() => setShowPasswordForm(!showPasswordForm)} 
          className="btn-secondary"
        >
          {showPasswordForm ? 'Cancel' : 'Change Password'}
        </button>

        {showPasswordForm && (
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="password-form">
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
            <button type="submit" className="btn-primary">Update Password</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;
