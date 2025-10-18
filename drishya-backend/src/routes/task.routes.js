const express = require('express');
const { body, param } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validation');
const TaskController = require('../controllers/task.controller');
const router = express.Router();

// Get tasks, search, overdue
router.get('/', authenticate, TaskController.getAll);
router.get('/search', authenticate, TaskController.search);
router.get('/overdue', authenticate, TaskController.overdue);
router.get('/:id', authenticate, param('id').isUUID(), handleValidation, TaskController.getById)


// Create, update, delete
router.post('/',
  authenticate,
  body('title').notEmpty(),
  body('priority').isIn(['Low','Medium','High']),
  body('due_date').optional().isISO8601(),
  body('team_id').optional().isUUID(),
  handleValidation,
  TaskController.create
);

router.put('/:id',
  authenticate,
  param('id').isUUID(),
  body('due_date').optional().isISO8601(),
  body('team_id').optional().isUUID(),
  handleValidation,
  TaskController.update
);

router.delete('/:id',
  authenticate,
  param('id').isUUID(),
  handleValidation,
  TaskController.delete
);

router.patch('/:id/assign-team',
  authenticate,
  param('id').isUUID(),
  body('team_id').isUUID(),
  handleValidation,
  TaskController.assignTeam
);

router.patch('/:id/unassign-team',
  authenticate,
  param('id').isUUID(),
  handleValidation,
  TaskController.unassignTeam
);

module.exports = router;
