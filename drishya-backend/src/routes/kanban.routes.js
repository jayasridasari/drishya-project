// src/routes/kanban.routes.js
 const express = require('express');
 const { body, param } = require('express-validator');
 const { authenticate } = require('../middleware/auth');
 const { handleValidation } = require('../middleware/validation');
 const KanbanController = require('../controllers/kanban.controller');
 const router = express.Router();
 router.get('/board', authenticate, KanbanController.getBoard);
 router.patch(
 '/tasks/:id/status',
 authenticate,
 param('id').isUUID(),
 body('status').isIn(['Todo','In Progress','Done']),
 handleValidation,
 KanbanController.updateStatus
 );
 router.patch(
 '/tasks/bulk-status',
 authenticate,
 body('updates').isArray(),
 body('updates.*.taskId').isUUID(),
 body('updates.*.status').isIn(['Todo','In Progress','Done']),
 handleValidation,
 KanbanController.bulkUpdate
 );
 module.exports = router;