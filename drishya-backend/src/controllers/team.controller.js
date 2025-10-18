// src/controllers/team.controller.js
 const { v4: uuidv4 } = require('uuid');
 const { query } = require('../config/database');
 const { createNotification } = require('../utils/notification');
 exports.createTeam = async (req,res,next) => {
 try {
 const { name, description='' } = req.body;
 const id = uuidv4();
 await query(
 'INSERT INTO teams (id,name,description,created_by) VALUES($1,$2,$3,$4)',
 [id,name,description,req.user.id]
 );
 res.status(201).json({ message:'Team created', id });
 } catch(err){ next(err); }
 };
 exports.getAllTeams = async (req,res,next) => {
 try {
 const result = await query('SELECT * FROM teams ORDER BY created_at DESC');
 res.json({ teams: result.rows });
 } catch(err){ next(err); }
 };
 exports.getTeamById = async (req,res,next) => {
 try {
 const { id } = req.params;
 const teamResult = await query('SELECT * FROM teams WHERE id=$1',[id]);
 if(!teamResult.rows.length) return res.status(404).json({ error:'Team not found' });
 const membersResult = await query(`
      SELECT u.id,u.name,u.email,u.role,tm.joined_at
      FROM team_members tm
      JOIN users u ON tm.user_id=u.id
      WHERE tm.team_id=$1
    `,[id]);
    res.json({ team:teamResult.rows[0], members:membersResult.rows });
  } catch(err){ next(err); }
 };
 exports.addMember = async (req,res,next) => {
  try {
    const { id:teamId } = req.params;
    const { userId } = req.body;
    const exists = await query('SELECT 1 FROM team_members WHERE team_id=$1 AND user_id=$
    if(exists.rows.length) return res.status(409).json({ error:'User already in team' });
    // Add
    await query('INSERT INTO team_members (team_id,user_id) VALUES($1,$2)',[teamId,userId
    // Notify user
    const teamName = (await query('SELECT name FROM teams WHERE id=$1',[teamId])).rows[0]
    await createNotification(userId,`You have been added to the team: ${teamName}`,'team_
    res.status(201).json({ message:'Member added to team' });
  } catch(err){ next(err); }
 };
 exports.removeMember = async (req,res,next) => {
  try {
    const { id:teamId, userId } = req.params;
    await query('DELETE FROM team_members WHERE team_id=$1 AND user_id=$2',[teamId,userId
    res.json({ message:'Member removed from team' });
  } catch(err){ next(err); }
 };
 exports.getTeamTasks = async (req,res,next) => {
  try {
    const { id:teamId } = req.params;
    const result = await query(`
      SELECT DISTINCT t.*
      FROM tasks t
      LEFT JOIN team_members tm ON t.assignee_id=tm.user_id AND tm.team_id=$1
      WHERE t.team_id=$1 OR tm.team_id IS NOT NULL
      ORDER BY t.created_at DESC
    `,[teamId]);
    res.json({ tasks: result.rows });
  } catch(err){ next(err); }
 };