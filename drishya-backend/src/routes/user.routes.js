const express = require('express');
const { body, param } = require('express-validator');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validation');
const UserController = require('../controllers/user.controller');
const router = express.Router();

// =====================================
// CRITICAL: Specific routes MUST come BEFORE parameterized routes!
// Order matters: /me BEFORE /:id
// =====================================

// ----------------
// SELF PROFILE ROUTES (Must be FIRST!)
// ----------------

// GET /api/users/me - Get own profile
router.get('/me', authenticate, UserController.getProfile);

// PUT /api/users/me - Update own profile
router.put(
  '/me',
  authenticate,
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  handleValidation,
  UserController.updateProfile
);

// PUT /api/users/me/password - Change password
router.put(
  '/me/password',
  authenticate,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  handleValidation,
  UserController.changePassword
);

// ----------------
// ADMIN USER MANAGEMENT ROUTES (After /me routes)
// ----------------

// GET /api/users - Get all users (Admin only)
router.get('/', authenticate, requireAdmin, UserController.getAll);

// GET /api/users/:id - Get user by ID (Admin only)
router.get(
  '/:id',
  authenticate,
  requireAdmin,
  param('id').isUUID().withMessage('Invalid user ID'),
  handleValidation,
  UserController.getById
);

// PUT /api/users/:id - Update user (Admin only)
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  param('id').isUUID().withMessage('Invalid user ID'),
  body('role').optional().isIn(['admin', 'member']).withMessage('Role must be admin or member'),
  body('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
  handleValidation,
  UserController.updateUser
);

// DELETE /api/users/:id - Delete user (Admin only)
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  param('id').isUUID().withMessage('Invalid user ID'),
  handleValidation,
  UserController.deleteUser
);

module.exports = router;
