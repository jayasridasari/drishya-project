import { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/formatters';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [profileUpdating, setProfileUpdating] = useState(false);
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    console.log('=== FETCHING PROFILE ===');
    setLoading(true);
    setError(null);
    
    try {
      console.log('Calling GET /api/profile');
      const response = await api.get('/api/profile');
      console.log('Profile response:', response);
      console.log('Profile data:', response.data);
      
      if (!response.data) {
        throw new Error('No data in response');
      }
      
      if (!response.data.profile) {
        throw new Error('No profile in response data');
      }
      
      const profileData = response.data.profile;
      console.log('Profile loaded:', profileData);
      
      setProfile(profileData);
      setProfileForm({
        name: profileData.name || '',
        email: profileData.email || ''
      });
      
    } catch (error) {
      console.error('=== PROFILE FETCH ERROR ===');
      console.error('Error object:', error);
      console.error('Response:', error.response);
      console.error('Response data:', error.response?.data);
      console.error('Status:', error.response?.status);
      
      let errorMessage = 'Failed to load profile';
      
      if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.request) {
        errorMessage = 'Cannot connect to server';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== UPDATING PROFILE ===');
    
    if (!profileForm.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    if (!profileForm.email.trim()) {
      toast.error('Email is required');
      return;
    }

    setProfileUpdating(true);

    try {
      const payload = {
        name: profileForm.name.trim(),
        email: profileForm.email.trim()
      };
      
      console.log('Sending profile update:', payload);
      const response = await api.put('/api/profile', payload);
      console.log('Profile update response:', response.data);
      
      toast.success('Profile updated successfully!');
      await fetchProfile();
    } catch (error) {
      console.error('=== PROFILE UPDATE ERROR ===');
      console.error('Response:', error.response?.data);
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach(err => {
          toast.error(`${err.param}: ${err.msg}`);
        });
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.request) {
        toast.error('Cannot connect to server');
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setProfileUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== UPDATING PASSWORD ===');
    
    if (!passwordForm.currentPassword) {
      toast.error('Current password is required');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setPasswordUpdating(true);

    try {
      const payload = {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      };
      
      console.log('Updating password...');
      const response = await api.put('/api/profile/password', payload);
      console.log('Password update response:', response.data);
      
      toast.success('Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
    } catch (error) {
      console.error('=== PASSWORD UPDATE ERROR ===');
      console.error('Response:', error.response?.data);
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach(err => {
          toast.error(`${err.param}: ${err.msg}`);
        });
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.request) {
        toast.error('Cannot connect to server');
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setPasswordUpdating(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="empty-state">
        <h3>Failed to load profile</h3>
        <p>{error}</p>
        <button onClick={fetchProfile} className="btn-primary" style={{ marginTop: '16px' }}>
          Retry
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="empty-state">
        <h3>Profile not found</h3>
        <button onClick={fetchProfile} className="btn-primary" style={{ marginTop: '16px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      {/* Profile Info Card */}
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
            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>{profile.email}</p>
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
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
              Account Status
            </div>
            <div style={{ fontWeight: 600, color: profile.is_active ? 'var(--success)' : 'var(--danger)' }}>
              {profile.is_active ? 'Active' : 'Inactive'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
              Member Since
            </div>
            <div style={{ fontWeight: 600 }}>{formatDate(profile.created_at)}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
              Role
            </div>
            <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{profile.role}</div>
          </div>
        </div>
      </div>

      {/* Update Profile Form */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 600 }}>Update Profile Information</h3>
        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label htmlFor="profile-name">Full Name</label>
            <input 
              id="profile-name"
              type="text" 
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="profile-email">Email Address</label>
            <input 
              id="profile-email"
              type="email" 
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              placeholder="Enter your email"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={profileUpdating} 
            className="btn-primary"
          >
            {profileUpdating ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Change Password</h3>
          <button 
            onClick={() => {
              setShowPasswordForm(!showPasswordForm);
              if (showPasswordForm) {
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }
            }}
            className="btn-secondary"
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="current-password">Current Password</label>
              <input 
                id="current-password"
                type="password" 
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="Enter current password"
                autoComplete="current-password"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-password">New Password (min. 8 characters)</label>
              <input 
                id="new-password"
                type="password" 
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Enter new password"
                autoComplete="new-password"
                minLength="8"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input 
                id="confirm-password"
                type="password" 
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                autoComplete="new-password"
                minLength="8"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={passwordUpdating} 
              className="btn-primary"
            >
              {passwordUpdating ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;
