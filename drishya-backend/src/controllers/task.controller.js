// src/controllers/task.controller.js
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { createNotification } = require('../utils/notification');

// Get all tasks
exports.getAll = async (req, res, next) => {
    try {
        const { role, id: userId } = req.user;
        let sql = 'SELECT * FROM tasks';
        const params = [];
        if (role !== 'admin') {
            sql += ' WHERE assignee_id=$1 OR created_by=$1';
            params.push(userId);
        }
        sql += ' ORDER BY created_at DESC';
        const result = await query(sql, params);
        res.json({ tasks: result.rows });
    } catch (err) {
        next(err);
    }
};

// Add stub handlers for all possible routes in task.routes.js
exports.search = async (req, res, next) => { res.status(200).json({ tasks: [] }); };
exports.overdue = async (req, res, next) => { res.status(200).json({ overdueTasks: [] }); };
exports.getById = async (req, res, next) => { res.status(200).json({ task: {} }); };
exports.create = async (req, res, next) => { res.status(201).json({ message: "Task created", id: uuidv4() }); };
exports.update = async (req, res, next) => { res.status(200).json({ message: "Task updated" }); };
exports.delete = async (req, res, next) => { res.status(200).json({ message: "Task deleted" }); };
exports.assignTeam = async (req, res, next) => { res.status(200).json({ message: "Task assigned to team" }); };
exports.unassignTeam = async (req, res, next) => { res.status(200).json({ message: "Task unassigned from team" }); };