// src/controllers/auth.controller.js
 const bcrypt = require('bcryptjs');
 const { v4: uuidv4 } = require('uuid');
 const { query } = require('../config/database');
 const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
 exports.register = async (req, res, next) => {
 try {
 const { email, password, role } = req.body;
 const exists = await query('SELECT 1 FROM users WHERE email=$1', [email]);
 if (exists.rows.length) return res.status(409).json({ error:'Email already in use' })
 const password_hash = await bcrypt.hash(password,10);
 const id = uuidv4();
 const name = email.split('@')[0];
 await query(
 'INSERT INTO users (id,name,email,password_hash,role) VALUES($1,$2,$3,$4,$5)',
 [id,name,email,password_hash,role]
 );
 const user = { id, email, role };
 const accessToken = generateAccessToken(user);
 const refreshToken = generateRefreshToken(user);
 await query(
 'INSERT INTO refresh_tokens (user_id,token,expires_at) VALUES($1,$2,NOW()+INTERVAL 
[id,refreshToken]
 );
 res.status(201).json({ user:{id,name,email,role}, accessToken, refreshToken });
 } catch(err){ next(err); }
 };
 exports.login = async (req, res, next) => {
 try {
 const { email, password } = req.body;
 const result = await query('SELECT * FROM users WHERE email=$1 AND is_active=true',[e
 if(!result.rows.length) return res.status(401).json({ error:'Invalid credentials' });
 const userRec = result.rows[0];
 const match = await bcrypt.compare(password,userRec.password_hash);
 if(!match) return res.status(401).json({ error:'Invalid credentials' });
 const user = { id:userRec.id, email:userRec.email, role:userRec.role };
 const accessToken = generateAccessToken(user);
 const refreshToken = generateRefreshToken(user);
 await query(
 'INSERT INTO refresh_tokens (user_id,token,expires_at) VALUES($1,$2,NOW()+INTERVAL 
[user.id,refreshToken]
 );
 res.json({
 user:{id:userRec.id,name:userRec.name,email:userRec.email,role:userRec.role},
accessToken, refreshToken
 });
 } catch(err){ next(err); }
 };
 exports.refresh = async (req, res, next) => {
 try {
 const { refreshToken } = req.body;
 let payload;
 try{ payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET); }
 catch(e){ return res.status(403).json({ error:'Invalid refresh token' }); }
 const stored = await query('SELECT 1 FROM refresh_tokens WHERE token=$1 AND expires_a
 if(!stored.rows.length) return res.status(403).json({ error:'Invalid refresh token' }
 const user = { id:payload.id, email:payload.email, role:payload.role };
 const accessToken = generateAccessToken(user);
 res.json({ accessToken });
 } catch(err){ next(err); }
 };
 exports.logout = async (req, res, next) => {
 try{
 await query('DELETE FROM refresh_tokens WHERE token=$1',[req.body.refreshToken]);
 res.json({ message:'Logged out successfully' });
 } catch(err){ next(err); }
 };