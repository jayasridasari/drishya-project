const express = require('express');
const { body, param } = require('express-validator');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validation');
const TaskController = require('../controllers/task.controller');
const router = express.Router();
const KanbanController = require('../controllers/kanban.controller');
// =====================================
// TASK ROUTES
// =====================================

// Get all tasks (with role-based filtering)
router.get('/', authenticate, TaskController.getAll);
router.get('/kanban/board', authenticate, KanbanController.getBoard);
// Advanced search with filters and pagination
router.get('/search', authenticate, TaskController.search);

// Get overdue tasks
router.get('/overdue', authenticate, TaskController.overdue);

// Get single task by ID (must be after /search and /overdue)
router.get(
  '/:id',
  authenticate,
  param('id').isUUID(),
  handleValidation,
  TaskController.getById
);

// Create new task
router.post(
  '/',
  authenticate,
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional(),
  body('status').optional().isIn(['Todo', 'In Progress', 'Done']),
  body('priority').notEmpty().isIn(['Low', 'Medium', 'High']).withMessage('Valid priority required'),
  body('due_date').optional({ nullable: true, checkFalsy: true }).isISO8601(),
  body('assignee_id').optional({ nullable: true, checkFalsy: true }).isUUID(),
  body('team_id').optional({ nullable: true, checkFalsy: true }).isUUID(),
  handleValidation,
  TaskController.create
);

// Update task
router.put(
  '/:id',
  authenticate,
  param('id').isUUID(),
  body('title').optional().trim().notEmpty(),
  body('description').optional(),
  body('status').optional().isIn(['Todo', 'In Progress', 'Done']),
  body('priority').optional().isIn(['Low', 'Medium', 'High']),
  body('due_date').optional({ nullable: true, checkFalsy: true }).isISO8601(),
  body('assignee_id').optional({ nullable: true, checkFalsy: true }).isUUID(),
  body('team_id').optional({ nullable: true, checkFalsy: true }).isUUID(),
  handleValidation,
  TaskController.update
);

// Delete task
router.delete(
  '/:id',
  authenticate,
  param('id').isUUID(),
  handleValidation,
  TaskController.delete
);

// Assign task to team (Admin only)
router.patch(
  '/:id/assign-team',
  authenticate,
  requireAdmin,
  param('id').isUUID(),
  body('team_id').isUUID(),
  handleValidation,
  TaskController.assignTeam
);

// Unassign task from team (Admin only)
router.patch(
  '/:id/unassign-team',
  authenticate,
  requireAdmin,
  param('id').isUUID(),
  handleValidation,
  TaskController.unassignTeam
);
router.patch(
  '/kanban/:id/status',
  authenticate,
  param('id').isUUID(),
  body('status').isIn(['Todo', 'In Progress', 'Done']),
  handleValidation,
  KanbanController.updateStatus
);
module.exports = router;
