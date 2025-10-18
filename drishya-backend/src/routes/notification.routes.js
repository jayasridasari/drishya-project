const express = require('express');
const { param } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validation');
const NotificationController = require('../controllers/notification.controller');
const router = express.Router();

router.get('/', authenticate, NotificationController.getAll);
router.patch('/:id/read',
  authenticate,
  param('id').isUUID(),
  handleValidation,
  NotificationController.markRead
);
router.patch('/read-all',
  authenticate,
  NotificationController.markAllRead
);

module.exports = router;
