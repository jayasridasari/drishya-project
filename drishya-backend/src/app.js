// src/app.js
const cors = require('cors');

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
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
const profileRoutes = require('./routes/profile.routes');

const app = express();

// Security & Middleware




app.use(helmet());
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/kanban', kanbanRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
