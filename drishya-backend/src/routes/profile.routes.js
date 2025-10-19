const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validation');
const UserController = require('../controllers/user.controller');
const router = express.Router();

// GET /api/profile - Get current user's profile
router.get('/', authenticate, UserController.getProfile);

// PUT /api/profile - Update profile
router.put(
  '/',
  authenticate,
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  handleValidation,
  UserController.updateProfile
);

// PUT /api/profile/password - Change password
router.put(
  '/password',
  authenticate,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  handleValidation,
  UserController.changePassword
);

module.exports = router;
