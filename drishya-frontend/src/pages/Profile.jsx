import { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/formatters';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    console.log('=== FETCHING PROFILE ===');
    setLoading(true);
    setError(null);
    
    try {
      console.log('Making GET request to /api/profile');
      const response = await api.get('/api/profile');
      
      console.log('Full response object:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      
      // Check if response exists
      if (!response || !response.data) {
        throw new Error('No response data received from server');
      }
      
      const data = response.data;
      console.log('Extracted data:', data);
      
      // Try all possible profile locations
      let profileData = null;
      
      if (data.profile) {
        console.log('Found profile in data.profile');
        profileData = data.profile;
      } else if (data.user) {
        console.log('Found profile in data.user');
        profileData = data.user;
      } else if (data.id) {
        console.log('Found profile directly in data');
        profileData = data;
      }
      
      console.log('Final profileData:', profileData);
      
      // Validate profile data
      if (!profileData) {
        throw new Error('Profile data not found in response. Response structure: ' + JSON.stringify(Object.keys(data)));
      }
      
      if (!profileData.id) {
        throw new Error('Profile missing required "id" field. Available fields: ' + JSON.stringify(Object.keys(profileData)));
      }
      
      console.log('✅ Profile validated successfully');
      console.log('Profile ID:', profileData.id);
      console.log('Profile name:', profileData.name);
      console.log('Profile email:', profileData.email);
      
      setProfile(profileData);
      setOriginalProfile(profileData);
      setProfileForm({
        name: profileData.name || '',
        email: profileData.email || ''
      });
      
    } catch (error) {
      console.error('=== PROFILE FETCH ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request made but no response received');
        console.error('Request:', error.request);
      }
      
      let errorMessage = 'Failed to load profile';
      
      if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        setTimeout(() => window.location.href = '/login', 2000);
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.request) {
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileForm.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    if (!profileForm.email.trim()) {
      toast.error('Email is required');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileForm.email)) {
      toast.error('Please enter a valid email');
      return;
    }

    setProfileSaving(true);

    try {
      const payload = {
        name: profileForm.name.trim(),
        email: profileForm.email.trim()
      };
      
      console.log('Updating profile with:', payload);
      const response = await api.put('/api/profile', payload);
      console.log('Update response:', response.data);
      
      toast.success('Profile updated successfully! ✅');
      await fetchProfile();
    } catch (error) {
      console.error('Profile update error:', error.response?.data);
      
      let errorMessage = 'Failed to update profile';
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach(err => {
          toast.error(`${err.param}: ${err.msg}`);
        });
        return;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (originalProfile) {
      setProfileForm({
        name: originalProfile.name || '',
        email: originalProfile.email || ''
      });
      toast.info('Changes discarded');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword) {
      toast.error('Current password is required');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setPasswordSaving(true);

    try {
      const payload = {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      };
      
      console.log('Updating password...');
      const response = await api.put('/api/profile/password', payload);
      console.log('Password updated:', response.data);
      
      toast.success('Password updated successfully! ✅');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Password update error:', error.response?.data);
      
      let errorMessage = 'Failed to update password';
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach(err => {
          toast.error(`${err.param}: ${err.msg}`);
        });
        return;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="empty-state">
        <h3>Failed to load profile</h3>
        <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</p>
        <button onClick={fetchProfile} className="btn-primary">
          Retry
        </button>
        <button 
          onClick={() => window.location.href = '/login'} 
          className="btn-secondary"
          style={{ marginLeft: '12px' }}
        >
          Back to Login
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="empty-state">
        <h3>Profile not found</h3>
        <p>Unable to load your profile information</p>
        <button onClick={fetchProfile} className="btn-primary">
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
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
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
            <div style={{ fontWeight: 600 }}>
              {profile.created_at ? formatDate(profile.created_at) : 'N/A'}
            </div>
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
            <label htmlFor="profile-name">Full Name *</label>
            <input 
              id="profile-name"
              type="text" 
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              placeholder="Enter your name"
              required
              disabled={profileSaving}
            />
          </div>
          <div className="form-group">
            <label htmlFor="profile-email">Email Address *</label>
            <input 
              id="profile-email"
              type="email" 
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              placeholder="Enter your email"
              required
              disabled={profileSaving}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="submit" 
              disabled={profileSaving} 
              className="btn-primary"
            >
              {profileSaving ? 'Updating...' : 'Update Profile'}
            </button>
            <button 
              type="button"
              onClick={handleCancelEdit}
              className="btn-secondary"
              disabled={profileSaving}
            >
              Cancel
            </button>
          </div>
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
              <label htmlFor="current-password">Current Password *</label>
              <input 
                id="current-password"
                type="password" 
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="Enter current password"
                autoComplete="current-password"
                required
                disabled={passwordSaving}
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-password">New Password (min. 8 characters) *</label>
              <input 
                id="new-password"
                type="password" 
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Enter new password"
                autoComplete="new-password"
                minLength="8"
                required
                disabled={passwordSaving}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm New Password *</label>
              <input 
                id="confirm-password"
                type="password" 
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                autoComplete="new-password"
                minLength="8"
                required
                disabled={passwordSaving}
              />
            </div>
            <button 
              type="submit" 
              disabled={passwordSaving} 
              className="btn-primary"
            >
              {passwordSaving ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;
