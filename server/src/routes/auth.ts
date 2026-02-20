import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { z } from 'zod';
import { User } from '../models/User.js';
import { fail, ok } from '../utils/response.js';
import { requireAuth, requireRole, signToken } from '../middleware/auth.js';
import { UserSession } from '../models/UserSession.js';
import { writeLog } from '../utils/log.js';

const r = Router();

r.post('/login', async (req, res) => {
  const body = z.object({ username: z.string(), password: z.string() }).safeParse(req.body);
  if (!body.success) return fail(res, 400, body.error.message);
  const user = await User.findOne({ username: body.data.username });
  if (!user || !(await bcrypt.compare(body.data.password, user.passwordHash))) return fail(res, 401, 'Invalid credentials');
  if (!user.isActive) return fail(res, 403, 'Account is inactive. Contact admin.');
  const token = signToken({ id: String(user._id), role: user.role as 'ADMIN' | 'EMPLOYEE' });
  await UserSession.create({ userId: user._id, token });
  await writeLog({ action: 'LOGIN', userId: String(user._id), message: `${user.username} logged in` });
  return ok(res, { token, user: { id: user._id, fullName: user.fullName, username: user.username, role: user.role } });
});

r.post('/logout', requireAuth, async (req, res) => {
  await UserSession.findOneAndUpdate({ token: req.token }, { active: false, logoutAt: new Date() });
  await writeLog({ action: 'LOGOUT', userId: req.authUser?.id });
  ok(res, null);
});

r.post('/register', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const body = z.object({ fullName: z.string(), username: z.string(), password: z.string().min(6), role: z.enum(['ADMIN', 'EMPLOYEE']) }).safeParse(req.body);
  if (!body.success) return fail(res, 400, body.error.message);
  const exists = await User.findOne({ username: body.data.username });
  if (exists) return fail(res, 409, 'Username exists');
  const passwordHash = await bcrypt.hash(body.data.password, 10);
  const user = await User.create({ ...body.data, passwordHash, isActive: true });
  await writeLog({ action: 'CREATE_USER', userId: req.authUser?.id, entity: 'User', entityId: String(user._id) });
  ok(res, user);
});

r.post('/forgot-password', async (req, res) => {
  const body = z.object({ username: z.string() }).safeParse(req.body);
  if (!body.success) return fail(res, 400, body.error.message);
  const user = await User.findOne({ username: body.data.username });
  if (!user) return ok(res, { token: null }, 'If account exists, token generated');
  const token = crypto.randomBytes(24).toString('hex');
  user.resetToken = token;
  user.resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
  await user.save();
  ok(res, { token, expiresAt: user.resetTokenExpiresAt });
});

r.post('/reset-password', async (req, res) => {
  const body = z.object({ token: z.string(), newPassword: z.string().min(6) }).safeParse(req.body);
  if (!body.success) return fail(res, 400, body.error.message);
  const user = await User.findOne({ resetToken: body.data.token, resetTokenExpiresAt: { $gt: new Date() } });
  if (!user) return fail(res, 400, 'Invalid token');
  user.passwordHash = await bcrypt.hash(body.data.newPassword, 10);
  user.resetToken = undefined;
  user.resetTokenExpiresAt = undefined;
  await user.save();
  ok(res, null, 'Password reset successful');
});

r.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.authUser?.id).select('-passwordHash');
  ok(res, user);
});

export default r;
