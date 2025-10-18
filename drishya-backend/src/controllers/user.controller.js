const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');

// Admin: get all users
exports.getAll = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id,name,email,role,is_active,created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: result.rows });
  } catch (err) { next(err); }
};

// Admin: get user by id
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT id,name,email,role,is_active,created_at FROM users WHERE id=$1',
      [id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ user: result.rows[0] });
  } catch (err) { next(err); }
};

// Admin: update user
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, is_active } = req.body;
    const updates = [], vals = [], props = { role, is_active };
    let idx = 1;
    for (const [k, v] of Object.entries(props)) {
      if (v !== undefined) { updates.push(`${k}=$${idx}`); vals.push(v); idx++; }
    }
    if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
    vals.push(id);
    await query(
      `UPDATE users SET ${updates.join(',')}, updated_at=NOW() WHERE id=$${idx}`,
      vals
    );
    res.json({ message: 'User updated successfully' });
  } catch (err) { next(err); }
};

// Admin: delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) return res.status(400).json({ error: 'Cannot delete your own account' });
    await query('DELETE FROM users WHERE id=$1', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) { next(err); }
};

// Self: get profile
exports.getProfile = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id,name,email,role,is_active,created_at FROM users WHERE id=$1',
      [req.user.id]
    );
    res.json({ profile: result.rows[0] });
  } catch (err) { next(err); }
};

// Self: update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updates = [], vals = [], props = { name, email };
    let idx = 1;
    if (email) {
      const conflict = await query('SELECT 1 FROM users WHERE email=$1 AND id!=$2', [email, req.user.id]);
      if (conflict.rows.length) return res.status(409).json({ error: 'Email already in use' });
    }
    for (const [k, v] of Object.entries(props)) {
      if (v) { updates.push(`${k}=$${idx}`); vals.push(v); idx++; }
    }
    if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
    vals.push(req.user.id);
    await query(
      `UPDATE users SET ${updates.join(',')}, updated_at=NOW() WHERE id=$${idx}`,
      vals
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (err) { next(err); }
};

// Self: change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    const match = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!match) return res.status(401).json({ error: 'Current password incorrect' });
    const newHash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2', [newHash, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) { next(err); }
};
