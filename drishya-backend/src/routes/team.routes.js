const express = require('express');
const { body, param } = require('express-validator');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validation');
const TeamController = require('../controllers/team.controller');
const router = express.Router();

// Create team
router.post(
  '/',
  authenticate, requireAdmin,
  body('name').trim().notEmpty(),
  body('description').optional(),
  handleValidation,
  TeamController.createTeam
);

// List teams
router.get('/', authenticate, TeamController.getAllTeams);

// Get team details
router.get('/:id',
  authenticate,
  param('id').isUUID(),
  handleValidation,
  TeamController.getTeamById
);

// Manage members
router.post(
  '/:id/members',
  authenticate, requireAdmin,
  param('id').isUUID(),
  body('userId').isUUID(),
  handleValidation,
  TeamController.addMember
);

router.delete(
  '/:id/members/:userId',
  authenticate, requireAdmin,
  param('id').isUUID(),
  param('userId').isUUID(),
  handleValidation,
  TeamController.removeMember
);

// Get team tasks
router.get(
  '/:id/tasks',
  authenticate,
  param('id').isUUID(),
  handleValidation,
  TeamController.getTeamTasks
);

module.exports = router;
