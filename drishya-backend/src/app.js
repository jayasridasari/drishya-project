// src/app.js
 const express = require('express');
 const helmet = require('helmet');
 const cors = require('cors');
 const cookieParser = require('cookie-parser');
 const { limiter } = require('./middleware/rateLimit');
 const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
 // Routes
 const authRoutes = require('./routes/auth.routes');
 const taskRoutes = require('./routes/task.routes');
 const userRoutes = require('./routes/user.routes');
 const teamRoutes = require('./routes/team.routes');
 const kanbanRoutes = require('./routes/kanban.routes');
 const dashboardRoutes = require('./routes/dashboard.routes');
 const notificationRoutes = require('./routes/notification.routes');
 const app = express();
 // Security & Middleware
 app.use(helmet());
 app.use(limiter);
 app.use(cors({ 
origin: process.env.CORS_ORIGIN || 'http://localhost:3000', 
credentials: true 
}));
 app.use(express.json());
 app.use(express.urlencoded({ extended: true }));
 app.use(cookieParser());
 // Health Check
app.get('/health', (req, res) => res.json({ status: 'OK' }));
 // Routes
 app.use('/api/auth', authRoutes);
 app.use('/api/tasks', taskRoutes);
 app.use('/api/users', userRoutes);
 app.use('/api/teams', teamRoutes);
 app.use('/api/kanban', kanbanRoutes);
 app.use('/api/dashboard', dashboardRoutes);
 app.use('/api/notifications', notificationRoutes);
 app.use('/api/profile', userRoutes);
 // Error Handlers
 app.use(notFoundHandler);
 app.use(errorHandler);
 module.exports = app;