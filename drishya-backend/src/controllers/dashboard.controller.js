 // src/controllers/dashboard.controller.js
 const { query } = require('../config/database');
 exports.getStats = async (req, res, next) => {
 try {
 const { role, id } = req.user;
 let condition = '1=1', params = [];
 if (role !== 'admin') {
 condition = '(assignee_id=$1 OR created_by=$1)';
 params = [id];
 }
 const [byStatus, byPriority, overdueRes, totalRes, weekRes] = await Promise.all([
 query(`SELECT status, COUNT(*) as count FROM tasks WHERE ${condition} GROUP BY stat
 query(`SELECT priority, COUNT(*) as count FROM tasks WHERE ${condition} GROUP BY pr
 query(`SELECT COUNT(*) as count FROM tasks WHERE ${condition} AND due_date< NOW() A
 query(`SELECT COUNT(*) as count FROM tasks WHERE ${condition}`, params),
 query(`SELECT COUNT(*) as count FROM tasks WHERE ${condition} AND due_date BETWEEN 
]);
 res.json({
 byStatus: byStatus.rows,
 byPriority: byPriority.rows,
 overdue: parseInt(overdueRes.rows[0]?.count || 0,10),
 total: parseInt(totalRes.rows[0]?.count || 0,10),
 dueThisWeek: parseInt(weekRes.rows[0]?.count || 0,10)
 });
 } catch (err) {
 next(err);
}
 };