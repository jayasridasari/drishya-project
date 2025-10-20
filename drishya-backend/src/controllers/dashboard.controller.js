const { query } = require('../config/database');

exports.getStats = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    
    let condition = '1=1';
    let params = [];
    let fromClause = 'FROM tasks t';

    if (role !== 'admin') {
      // ✅ UPDATED: Include team tasks for members
      fromClause = 'FROM tasks t LEFT JOIN team_members tm ON t.team_id = tm.team_id';
      condition = '(t.assignee_id = $1 OR t.created_by = $1 OR tm.user_id = $1)';
      params = [id];
    }

    // ✅ UPDATED: Use DISTINCT and proper table aliases
    const [byStatus, byPriority, overdueRes, totalRes, weekRes] = await Promise.all([
      // By Status
      query(
        `SELECT t.status, COUNT(DISTINCT t.id) as count 
         ${fromClause} 
         WHERE ${condition} 
         GROUP BY t.status`,
        params
      ),
      
      // By Priority
      query(
        `SELECT t.priority, COUNT(DISTINCT t.id) as count 
         ${fromClause} 
         WHERE ${condition} 
         GROUP BY t.priority`,
        params
      ),
      
      // Overdue Tasks
      query(
        `SELECT COUNT(DISTINCT t.id) as count 
         ${fromClause} 
         WHERE ${condition} 
         AND t.due_date < CURRENT_DATE 
         AND t.status != 'Done'`,
        params
      ),
      
      // Total Tasks
      query(
        `SELECT COUNT(DISTINCT t.id) as count 
         ${fromClause} 
         WHERE ${condition}`,
        params
      ),
      
      // Due This Week
      query(
        `SELECT COUNT(DISTINCT t.id) as count 
         ${fromClause} 
         WHERE ${condition} 
         AND t.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' 
         AND t.status != 'Done'`,
        params
      )
    ]);

    res.json({
      byStatus: byStatus.rows,
      byPriority: byPriority.rows,
      overdue: parseInt(overdueRes.rows[0]?.count || 0, 10),
      total: parseInt(totalRes.rows[0]?.count || 0, 10),
      dueThisWeek: parseInt(weekRes.rows[0]?.count || 0, 10)
    });
  } catch (err) {
    console.error('❌ Dashboard stats error:', err);
    next(err);
  }
};
