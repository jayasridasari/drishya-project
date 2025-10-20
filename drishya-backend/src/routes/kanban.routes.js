const express = require('express');
const { body, param } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validation');
const KanbanController = require('../controllers/kanban.controller');
const router = express.Router();

// Get kanban board
router.get('/board', authenticate, KanbanController.getBoard);

// Update task status (for drag & drop)
router.patch(
  '/:id/status',
  authenticate,
  param('id').isUUID().withMessage('Invalid task ID'),
  body('status').isIn(['Todo', 'In Progress', 'Done']).withMessage('Invalid status'),
  handleValidation,
  KanbanController.updateStatus
);

// Bulk update (optional - for future use)
router.post(
  '/bulk-update',
  authenticate,
  body('updates').isArray().withMessage('Updates must be an array'),
  handleValidation,
  KanbanController.bulkUpdate
);

module.exports = router;
