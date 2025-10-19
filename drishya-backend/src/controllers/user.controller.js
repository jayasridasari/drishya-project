const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');

// =====================================
// ADMIN: Get all users
// =====================================
exports.getAll = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: result.rows });
  } catch (err) {
    next(err);
  }
};

// =====================================
// ADMIN: Get user by ID
// =====================================
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1',
      [id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// =====================================
// ADMIN: Update user
// =====================================
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, is_active } = req.body;
    
    const updates = [];
    const vals = [];
    let idx = 1;
    
    if (role !== undefined) {
      updates.push(`role = $${idx++}`);
      vals.push(role);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${idx++}`);
      vals.push(is_active);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    vals.push(id);
    const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx}`;
    
    await query(sql, vals);
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    next(err);
  }
};

// =====================================
// ADMIN: Delete user
// =====================================
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    await query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// =====================================
// SELF: Get profile (FIXED)
exports.getProfile = async (req, res, next) => {
  try {
    console.log('📋 Fetching profile for user:', req.user.id);
    
    const result = await query(
      'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (!result.rows.length) {
      console.error('❌ User not found:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    const profile = result.rows[0];
    console.log('✅ Profile found:', profile.email);
    
    // CRITICAL: Return in this exact format
    res.json({ profile });  // NOT { user } or { users }
  } catch (err) {
    console.error('❌ Get profile error:', err);
    next(err);
  }
};


// =====================================
// SELF: Update profile (FIXED)
// =====================================
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    
    console.log('📝 Updating profile for user:', req.user.id);
    console.log('New data:', { name, email });
    
    // Validate input
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Check if email already exists for another user
    if (email) {
      const conflict = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, req.user.id]
      );
      if (conflict.rows.length > 0) {
        console.warn('⚠️ Email already in use:', email);
        return res.status(409).json({ error: 'Email already in use by another account' });
      }
    }
    
    // Update user
    await query(
      'UPDATE users SET name = $1, email = $2, updated_at = NOW() WHERE id = $3',
      [name.trim(), email.trim(), req.user.id]
    );
    
    console.log('✅ Profile updated successfully');
    
    // CRITICAL: Fetch and return updated profile
    const result = await query(
      'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    res.json({ 
      message: 'Profile updated successfully',
      profile: result.rows[0]  // Frontend expects this
    });
  } catch (err) {
    console.error('❌ Update profile error:', err);
    next(err);
  }
};

// =====================================
// SELF: Change password (FIXED)
// =====================================
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    console.log('🔐 Changing password for user:', req.user.id);
    
    // Validate input
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required' });
    }
    
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }
    
    // Get current password hash
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const match = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!match) {
      console.warn('⚠️ Invalid current password');
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, result.rows[0].password_hash);
    if (isSamePassword) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }
    
    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newHash, req.user.id]
    );
    
    console.log('✅ Password changed successfully');
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('❌ Change password error:', err);
    next(err);
  }
};
