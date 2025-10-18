// src/utils/jwt.js
 const jwt = require('jsonwebtoken');
 const generateAccessToken = (user) => {
 return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
 expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m'
 });
 };
 const generateRefreshToken = (user) => {
 return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
 expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d'
 });
 };
 module.exports = { generateAccessToken, generateRefreshToken };