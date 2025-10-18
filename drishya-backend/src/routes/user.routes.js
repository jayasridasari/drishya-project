 // src/routes/user.routes.js
 const express = require('express');
 const { body, param } = require('express-validator');
 const { authenticate, requireAdmin } = require('../middleware/auth');
 const { handleValidation } = require('../middleware/validation');
 const UserController = require('../controllers/user.controller');
 const router = express.Router();
 // Admin user management
 router.get('/', authenticate, requireAdmin, UserController.getAll);
 router.get('/:id', authenticate, requireAdmin, param('id').isUUID(), handleValidation, Us
 router.put('/:id', authenticate, requireAdmin,
param('id').isUUID(),
 body('role').optional().isIn(['admin','member']),
 body('is_active').optional().isBoolean(),
 handleValidation,
 UserController.updateUser
 );
 router.delete('/:id', authenticate, requireAdmin, param('id').isUUID(), handleValidation,
 // Self profile
 router.get('/me', authenticate, UserController.getProfile);
 router.put('/me', authenticate,
 body('name').optional().trim().notEmpty(),
 body('email').optional().isEmail().normalizeEmail(),
 handleValidation,
 UserController.updateProfile
 );
 router.put('/me/password', authenticate,
 body('currentPassword').notEmpty(),
 body('newPassword').isLength({ min: 8 }),
 handleValidation,
 UserController.changePassword
 );
 module.exports = router;