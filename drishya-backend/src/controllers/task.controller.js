// src/controllers/task.controller.js
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { createNotification } = require('../utils/notification');

// =====================================
// GET ALL TASKS
// =====================================
exports.getAll = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    
    let sql;
    const params = [];

    if (role === 'admin') {
      // Admins see all tasks
      sql = 'SELECT * FROM tasks ORDER BY created_at DESC';
    } else {
      // ✅ Members ONLY see tasks assigned to them, created by them, OR assigned to their teams
      sql = `
        SELECT DISTINCT t.* 
        FROM tasks t
        LEFT JOIN team_members tm ON t.team_id = tm.team_id
        WHERE (
          t.assignee_id = $1 
          OR t.created_by = $1 
          OR tm.user_id = $1
        )
        ORDER BY t.created_at DESC
      `;
      params.push(userId);
    }

    const result = await query(sql, params);
    
    console.log(`✅ User ${userId} (${role}) fetched ${result.rows.length} tasks`); // ✅ DEBUG LOG
    
    res.json({ tasks: result.rows });
  } catch (err) {
    console.error('❌ getAll error:', err);
    next(err);
  }
};


// =====================================
// SEARCH TASKS (with filters & pagination)
// =====================================
exports.search = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(1000, parseInt(req.query.limit, 10) || 50));
    const { priority, assignee, status, search } = req.query;

    // Build WHERE conditions
    const conditions = [];
    const params = [];
    let paramCount = 0;

    // Role-based access control
    if (role !== 'admin') {
      paramCount++;
      conditions.push(`(
        t.assignee_id = $${paramCount} 
        OR t.created_by = $${paramCount} 
        OR tm.user_id = $${paramCount}
      )`);
      params.push(userId);
    }

    // Priority filter
    if (priority) {
      paramCount++;
      conditions.push(`t.priority = $${paramCount}`);
      params.push(priority);
    }

    // Assignee filter
    if (assignee) {
      paramCount++;
      conditions.push(`t.assignee_id = $${paramCount}`);
      params.push(assignee);
    }

    // Status filter
    if (status) {
      paramCount++;
      conditions.push(`t.status = $${paramCount}`);
      params.push(status);
    }

    // Search in title and description
    if (search) {
      paramCount++;
      conditions.push(`(t.title ILIKE $${paramCount} OR t.description ILIKE $${paramCount})`);
      params.push(`%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Join with team_members for team-based access
    const fromClause = role === 'admin' 
      ? 'FROM tasks t'
      : 'FROM tasks t LEFT JOIN team_members tm ON t.team_id = tm.team_id';

    // Get total count
    const countSql = `SELECT COUNT(DISTINCT t.id) AS cnt ${fromClause} ${whereClause}`;
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0]?.cnt || 0, 10);

    // Get paginated data
    const offset = (page - 1) * limit;
    const dataSql = `
      SELECT DISTINCT t.* 
      ${fromClause} 
      ${whereClause} 
      ORDER BY t.created_at DESC 
      LIMIT $${++paramCount} 
      OFFSET $${++paramCount}
    `;
    const dataParams = [...params, limit, offset];

    console.log('🔍 Search SQL:', dataSql);
    console.log('🔍 Search Params:', dataParams);

    const result = await query(dataSql, dataParams);

    console.log(`✅ Found ${result.rows.length} tasks (Total: ${total})`);

    res.json({
      tasks: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('❌ Search error:', err);
    next(err);
  }
};

// =====================================
// GET OVERDUE TASKS
// =====================================
exports.overdue = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    
    let sql;
    const params = [];

    if (role === 'admin') {
      sql = `
        SELECT * FROM tasks
        WHERE due_date IS NOT NULL
        AND due_date < CURRENT_DATE
        AND status != 'Done'
        ORDER BY due_date ASC
      `;
    } else {
      sql = `
        SELECT DISTINCT t.* 
        FROM tasks t
        LEFT JOIN team_members tm ON t.team_id = tm.team_id
        WHERE due_date IS NOT NULL
        AND due_date < CURRENT_DATE
        AND status != 'Done'
        AND (
          t.assignee_id = $1 
          OR t.created_by = $1 
          OR tm.user_id = $1
        )
        ORDER BY t.due_date ASC
      `;
      params.push(userId);
    }

    const result = await query(sql, params);
    res.json({ overdueTasks: result.rows });
  } catch (err) {
    next(err);
  }
};

// =====================================
// GET TASK BY ID
// =====================================
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    let sql;
    const params = [id];

    if (role === 'admin') {
      sql = 'SELECT * FROM tasks WHERE id = $1';
    } else {
      sql = `
        SELECT DISTINCT t.* 
        FROM tasks t
        LEFT JOIN team_members tm ON t.team_id = tm.team_id
        WHERE t.id = $1 
        AND (
          t.assignee_id = $2 
          OR t.created_by = $2 
          OR tm.user_id = $2
        )
      `;
      params.push(userId);
    }

    const result = await query(sql, params);
    
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// =====================================
// CREATE TASK
// =====================================
exports.create = async (req, res, next) => {
  try {
    const {
      title,
      description = '',
      status = 'Todo',
      priority,
      due_date = null,
      assignee_id = null,
      team_id = null
    } = req.body;

    const created_by = req.user.id;
    const id = uuidv4();

    // Validate due date is not in the past
    if (due_date) {
      const dueDateTime = new Date(due_date);
      const now = new Date();
      const dueDate = new Date(dueDateTime.getFullYear(), dueDateTime.getMonth(), dueDateTime.getDate());
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (dueDate < today) {
        return res.status(400).json({ error: 'Due date cannot be in the past' });
      }
    }

    // Validate team exists if provided
    if (team_id) {
      const teamCheck = await query('SELECT 1 FROM teams WHERE id = $1', [team_id]);
      if (!teamCheck.rows.length) {
        return res.status(404).json({ error: 'Team not found' });
      }
    }

    // Validate assignee exists if provided
    if (assignee_id) {
      const userCheck = await query('SELECT 1 FROM users WHERE id = $1 AND is_active = true', [assignee_id]);
      if (!userCheck.rows.length) {
        return res.status(404).json({ error: 'Assignee not found or inactive' });
      }
    }

    // Create task
    await query(
      `INSERT INTO tasks (id, title, description, status, priority, due_date, assignee_id, created_by, team_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, title, description, status, priority, due_date, assignee_id, created_by, team_id]
    );

    console.log(`✅ Task created: ${id} by user ${created_by}`);

    // Send notification to assignee if assigned
    if (assignee_id && assignee_id !== created_by) {
      try {
        await createNotification(
          assignee_id,
          `You have been assigned to task: "${title}"`,
          'task_assigned'
        );
      } catch (notifErr) {
        console.error('Failed to create notification:', notifErr);
      }
    }

    // If task is assigned to a team, notify all team members
    if (team_id) {
      try {
        // Get all team members
        const teamMembers = await query(
          `SELECT user_id FROM team_members WHERE team_id = $1`,
          [team_id]
        );

        // Send notification to each team member (except creator)
        for (const member of teamMembers.rows) {
          if (member.user_id !== created_by) {
            await createNotification(
              member.user_id,
              `New team task assigned: "${title}"`,
              'team_task_assigned'
            );
          }
        }

        console.log(`✅ Notified ${teamMembers.rows.length} team members about task ${id}`);
      } catch (notifErr) {
        console.error('Failed to notify team members:', notifErr);
      }
    }

    res.status(201).json({
      message: 'Task created successfully',
      id
    });
  } catch (err) {
    console.error('❌ Create task error:', err);
    next(err);
  }
};

// =====================================
// UPDATE TASK
// =====================================
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;
    const { title, description, status, priority, due_date, assignee_id, team_id } = req.body;

    // Check if task exists and user has access
    let checkSql = 'SELECT * FROM tasks WHERE id = $1';
    const checkParams = [id];

    if (role !== 'admin') {
      checkSql += ' AND (assignee_id = $2 OR created_by = $2)';
      checkParams.push(userId);
    }

    const taskCheck = await query(checkSql, checkParams);
    if (!taskCheck.rows.length) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    const oldTask = taskCheck.rows[0];

    // Validate due date if provided
    if (due_date) {
      const dueDateTime = new Date(due_date);
      const now = new Date();
      const dueDate = new Date(dueDateTime.getFullYear(), dueDateTime.getMonth(), dueDateTime.getDate());
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (dueDate < today) {
        return res.status(400).json({ error: 'Due date cannot be in the past' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramCount = 0;

    if (title !== undefined) {
      updates.push(`title = $${++paramCount}`);
      params.push(title);
    }

    if (description !== undefined) {
      updates.push(`description = $${++paramCount}`);
      params.push(description);
    }

    if (status !== undefined) {
      updates.push(`status = $${++paramCount}`);
      params.push(status);
    }

    if (priority !== undefined) {
      updates.push(`priority = $${++paramCount}`);
      params.push(priority);
    }

    if (due_date !== undefined) {
      updates.push(`due_date = $${++paramCount}`);
      params.push(due_date);
    }

    if (assignee_id !== undefined) {
      updates.push(`assignee_id = $${++paramCount}`);
      params.push(assignee_id);
    }

    if (team_id !== undefined) {
      updates.push(`team_id = $${++paramCount}`);
      params.push(team_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const updateSql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${++paramCount}`;

    await query(updateSql, params);

    console.log(`✅ Task updated: ${id}`);

    // Send notification if assignee changed
    if (assignee_id !== undefined && assignee_id !== oldTask.assignee_id && assignee_id) {
      try {
        await createNotification(
          assignee_id,
          `You have been assigned to task: "${oldTask.title}"`,
          'task_assigned'
        );
      } catch (notifErr) {
        console.error('Failed to create notification:', notifErr);
      }
    }

    res.json({ message: 'Task updated successfully' });
  } catch (err) {
    console.error('❌ Update task error:', err);
    next(err);
  }
};

// =====================================
// DELETE TASK
// =====================================
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    // Check if task exists and user has access
    let checkSql = 'SELECT * FROM tasks WHERE id = $1';
    const checkParams = [id];

    if (role !== 'admin') {
      checkSql += ' AND created_by = $2';
      checkParams.push(userId);
    }

    const taskCheck = await query(checkSql, checkParams);
    if (!taskCheck.rows.length) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    await query('DELETE FROM tasks WHERE id = $1', [id]);
    console.log(`✅ Task deleted: ${id}`);

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('❌ Delete task error:', err);
    next(err);
  }
};

// =====================================
// ASSIGN TASK TO TEAM
// =====================================
exports.assignTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { team_id } = req.body;

    // Verify team exists
    const teamCheck = await query('SELECT 1 FROM teams WHERE id = $1', [team_id]);
    if (!teamCheck.rows.length) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Verify task exists
    const taskCheck = await query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (!taskCheck.rows.length) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await query('UPDATE tasks SET team_id = $1, updated_at = NOW() WHERE id = $2', [team_id, id]);
    console.log(`✅ Task ${id} assigned to team ${team_id}`);

    // Notify team members
    try {
      const teamMembers = await query(
        `SELECT user_id FROM team_members WHERE team_id = $1`,
        [team_id]
      );

      const task = taskCheck.rows[0];
      for (const member of teamMembers.rows) {
        await createNotification(
          member.user_id,
          `Team task assigned: "${task.title}"`,
          'team_task_assigned'
        );
      }
    } catch (notifErr) {
      console.error('Failed to notify team members:', notifErr);
    }

    res.json({ message: 'Task assigned to team successfully' });
  } catch (err) {
    console.error('❌ Assign team error:', err);
    next(err);
  }
};

// =====================================
// UNASSIGN TASK FROM TEAM
// =====================================
exports.unassignTeam = async (req, res, next) => {
  try {
    const { id } = req.params;

    const taskCheck = await query('SELECT 1 FROM tasks WHERE id = $1', [id]);
    if (!taskCheck.rows.length) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await query('UPDATE tasks SET team_id = NULL, updated_at = NOW() WHERE id = $1', [id]);
    console.log(`✅ Task ${id} unassigned from team`);

    res.json({ message: 'Task unassigned from team successfully' });
  } catch (err) {
    console.error('❌ Unassign team error:', err);
    next(err);
  }
};
