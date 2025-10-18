// src/middleware/errorHandler.js
 const errorHandler = (err, req, res, next) => {
 console.error(err);
 const status = err.status || 500;
 const message = err.message || 'Internal Server Error';
 res.status(status).json({ error: message });
 };
 const notFoundHandler = (req, res) => {
 res.status(404).json({ error: 'Not found' });
 };
 module.exports = { errorHandler, notFoundHandler };