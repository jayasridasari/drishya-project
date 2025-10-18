// src/controllers/notification.controller.js
 const { query } = require('../config/database');
 exports.getAll = async (req, res, next) => {
 try {
 const result = await query(
 `SELECT * FROM notifications
 WHERE user_id=$1
 ORDER BY created_at DESC
 LIMIT 50`,
 [req.user.id]
 );
 res.json({ notifications: result.rows });
 } catch (err) {
 next(err);
 }
 };
 exports.markRead = async (req, res, next) => {
 try {
 const { id } = req.params;
 await query(
 'UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2',
 [id, req.user.id]
 );
 res.json({ message: 'Notification marked as read' });
 } catch (err) {
 next(err);
 }
 };
 exports.markAllRead = async (req, res, next) => {
 try {
 await query(
'UPDATE notifications SET is_read=true WHERE user_id=$1',
 [req.user.id]
 );
 res.json({ message: 'All notifications marked as read' });
 } catch (err) {
 next(err);
 }
 };