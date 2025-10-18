 // src/controllers/kanban.controller.js
 const { query } = require('../config/database');
 const { createNotification } = require('../utils/notification');
 exports.getBoard = async (req, res, next) => {
 try {
 const { role, id } = req.user;
 let sql = 'SELECT * FROM tasks';
    const params = [];
    if (role !== 'admin') {
      sql += ' WHERE assignee_id=$1 OR created_by=$1';
      params.push(id);
    }
    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    res.json({
      board: {
        Todo: result.rows.filter(t => t.status === 'Todo'),
        'In Progress': result.rows.filter(t => t.status === 'In Progress'),
        Done: result.rows.filter(t => t.status === 'Done')
      }
    });
  } catch (err) {
    next(err);
  }
 };
 exports.updateStatus = async (req, res, next) => {
  try {
    const { id: taskId } = req.params;
    const { status } = req.body;
    const taskResult = await query(
      'SELECT title, created_by, assignee_id FROM tasks WHERE id=$1',
      [taskId]
    );
    if (!taskResult.rows.length) return res.status(404).json({ error: 'Task not found' })
    const task = taskResult.rows[0];
    await query(
      'UPDATE tasks SET status=$1, updated_at=NOW() WHERE id=$2',
      [status, taskId]
    );
    if (status === 'Done' && task.created_by !== req.user.id) {
      await createNotification(task.created_by, `Task "${task.title}" has been marked as 
    }
    if (task.assignee_id && task.assignee_id !== req.user.id && task.assignee_id !== task
      await createNotification(task.assignee_id, `Task "${task.title}" status changed to 
    }
    res.json({ message: 'Task status updated', status });
  } catch (err) {
    next(err);
  }
 };
 exports.bulkUpdate = async (req, res, next) => {
  const client = await query.pool.connect();
  try {
    const { updates } = req.body;
    await client.query('BEGIN');
    for (const { taskId, status } of updates) {
      await client.query('UPDATE tasks SET status=$1, updated_at=NOW() WHERE id=$2', [sta
    }
    await client.query('COMMIT');
    res.json({ message: 'Tasks updated successfully', count: updates.length });
  } catch (err) {
await client.query('ROLLBACK');
 next(err);
 } finally {
 client.release();
 }
 };