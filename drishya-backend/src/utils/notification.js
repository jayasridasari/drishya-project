// src/utils/notification.js
 const { v4: uuidv4 } = require('uuid');
 const { query } = require('../config/database');
 const createNotification = async (userId, message, type = 'info') => {
 try {
 const id = uuidv4();
 await query(
 'INSERT INTO notifications (id, user_id, message, type) VALUES ($1, $2, $3, $4)',
 [id, userId, message, type]
 );
 } catch (err) {
 console.error('Failed to create notification:', err);
 }
 };
module.exports = { createNotification };