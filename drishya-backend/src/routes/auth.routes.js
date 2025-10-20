// src/routes/auth.routes.js
 const express = require('express');
 const { body } = require('express-validator');
 const { handleValidation } = require('../middleware/validation');
 const AuthController = require('../controllers/auth.controller');
 const router = express.Router();
 const { authenticate } = require('../middleware/auth');
 router.post(
 '/register',
 body('email').isEmail().normalizeEmail(),
 body('password').isLength({ min: 8 }),
 body('role').notEmpty().isIn(['admin','member']),
 handleValidation,
 AuthController.register
 );
 router.post('/login',
 body('email').isEmail().normalizeEmail(),
 body('password').notEmpty(),
 handleValidation,
 AuthController.login
 );
 router.post(
 '/refresh',
 body('refreshToken').notEmpty(),
 handleValidation,
 AuthController.refresh
 );
 router.post(
 '/logout',
 body('refreshToken').notEmpty(),
 handleValidation,
 AuthController.logout
 );
 router.get('/me', authenticate, (req, res) => {
    console.log('🔍 /api/auth/me called, user:', req.user); // Debug log
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  });
});
module.exports = router;