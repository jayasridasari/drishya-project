// src/routes/dashboard.routes.js
 const express = require('express');
 const { authenticate } = require('../middleware/auth');
 const DashboardController = require('../controllers/dashboard.controller');
 const router = express.Router();
 router.get('/stats', authenticate, DashboardController.getStats);
 module.exports = router;