const { pool, query } = require('../config/database');
const { createNotification } = require('../utils/notification');

exports.getBoard = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    
    let sql;
    const params = [];

    if (role === 'admin') {
      sql = 'SELECT * FROM tasks ORDER BY created_at DESC';
    } else {
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
      params.push(id);
    }

    const result = await query(sql, params);

    res.json({
      board: {
        Todo: result.rows.filter(t => t.status === 'Todo'),
        'In Progress': result.rows.filter(t => t.status === 'In Progress'),
        Done: result.rows.filter(t => t.status === 'Done')
      }
    });
  } catch (err) {
    console.error('❌ Kanban board error:', err);
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id: taskId } = req.params;
    const { status } = req.body;

    const taskResult = await query(
      'SELECT title, created_by, assignee_id FROM tasks WHERE id = $1',
      [taskId]
    );

    if (!taskResult.rows.length) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskResult.rows[0];

    await query(
      'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, taskId]
    );

    if (status === 'Done' && task.created_by && task.created_by !== req.user.id) {
      await createNotification(
        task.created_by,
        `Task "${task.title}" has been marked as Done`,
        'task_completed'
      );
    }

    if (
      task.assignee_id &&
      task.assignee_id !== req.user.id &&
      task.assignee_id !== task.created_by
    ) {
      await createNotification(
        task.assignee_id,
        `Task "${task.title}" status changed to ${status}`,
        'task_updated'
      );
    }

    res.json({ message: 'Task status updated', status });
  } catch (err) {
    console.error('❌ Update status error:', err);
    next(err);
  }
};

exports.bulkUpdate = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Invalid updates array' });
    }

    await client.query('BEGIN');

    for (const { taskId, status } of updates) {
      await client.query(
        'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2',
        [status, taskId]
      );
    }

    await client.query('COMMIT');

    res.json({ 
      message: 'Tasks updated successfully', 
      count: updates.length 
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Bulk update error:', err);
    next(err);
  } finally {
    client.release();
  }
};
