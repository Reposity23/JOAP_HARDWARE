import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { UserSession } from '../models/UserSession.js';
import { fail, ok } from '../utils/response.js';
import { writeLog } from '../utils/log.js';

const r = Router();
r.use(requireAuth, requireRole(['ADMIN']));

const usernameRule = z
  .string()
  .min(4, 'Username must be at least 4 characters')
  .max(32)
  .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can contain letters, numbers, underscore, dash, dot only');
const passwordRule = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 'Password must contain uppercase, lowercase, and number');

r.get('/', async (req, res) => {
  const query = z
    .object({
      search: z.string().optional().default(''),
      role: z.enum(['ADMIN', 'EMPLOYEE']).optional(),
      status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
      page: z.coerce.number().min(1).default(1),
      pageSize: z.coerce.number().min(1).max(100).default(10)
    })
    .safeParse(req.query);
  if (!query.success) return fail(res, 400, query.error.message);

  const { search, role, status, page, pageSize } = query.data;
  const filter: Record<string, unknown> = {};
  if (search) filter.username = { $regex: search, $options: 'i' };
  if (role) filter.role = role;
  if (status) filter.isActive = status === 'ACTIVE';

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('-passwordHash -resetToken -resetTokenExpiresAt')
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  const ids = users.map((u) => u._id);
  const sessions = await UserSession.aggregate([
    { $match: { userId: { $in: ids } } },
    { $group: { _id: '$userId', lastLogin: { $max: '$loginAt' } } }
  ]);
  const sessionMap = new Map(sessions.map((s) => [String(s._id), s.lastLogin]));

  ok(res, {
    items: users.map((u) => ({ ...u, lastLogin: sessionMap.get(String(u._id)) || null })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
  });
});

r.post('/', async (req, res) => {
  const body = z
    .object({ username: usernameRule, temporaryPassword: passwordRule, role: z.enum(['ADMIN', 'EMPLOYEE']), isActive: z.boolean().default(true) })
    .safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ success: false, message: 'Validation failed', fieldErrors: body.error.flatten().fieldErrors });
  }
  const existing = await User.findOne({ username: body.data.username });
  if (existing) return fail(res, 409, 'Username already exists');

  const passwordHash = await bcrypt.hash(body.data.temporaryPassword, 10);
  const created = await User.create({
    fullName: body.data.username,
    username: body.data.username,
    passwordHash,
    role: body.data.role,
    isActive: body.data.isActive
  });

  await writeLog({
    action: 'USER_CREATED',
    eventName: 'USER_CREATED',
    userId: req.authUser?.id,
    entity: 'User',
    entityId: String(created._id),
    meta: { actorUserId: req.authUser?.id, targetUserId: String(created._id), role: created.role, isActive: created.isActive }
  });

  ok(
    res,
    {
      user: {
        _id: created._id,
        username: created.username,
        role: created.role,
        isActive: created.isActive,
        createdAt: created.createdAt,
        lastLogin: null
      },
      temporaryPassword: body.data.temporaryPassword
    },
    'User created'
  );
});

r.patch('/:id/status', async (req, res) => {
  const body = z.object({ isActive: z.boolean() }).safeParse(req.body);
  if (!body.success) return fail(res, 400, body.error.message);

  const updated = await User.findByIdAndUpdate(req.params.id, { isActive: body.data.isActive }, { new: true }).select(
    '-passwordHash -resetToken -resetTokenExpiresAt'
  );
  if (!updated) return fail(res, 404, 'User not found');

  await writeLog({
    action: 'USER_STATUS_CHANGED',
    eventName: 'USER_STATUS_CHANGED',
    userId: req.authUser?.id,
    entity: 'User',
    entityId: String(updated._id),
    meta: { actorUserId: req.authUser?.id, targetUserId: String(updated._id), isActive: updated.isActive }
  });
  ok(res, updated, 'User status updated');
});

r.patch('/:id/role', async (req, res) => {
  const body = z.object({ role: z.enum(['ADMIN', 'EMPLOYEE']) }).safeParse(req.body);
  if (!body.success) return fail(res, 400, body.error.message);

  const updated = await User.findByIdAndUpdate(req.params.id, { role: body.data.role }, { new: true }).select(
    '-passwordHash -resetToken -resetTokenExpiresAt'
  );
  if (!updated) return fail(res, 404, 'User not found');

  await writeLog({
    action: 'USER_ROLE_CHANGED',
    eventName: 'USER_ROLE_CHANGED',
    userId: req.authUser?.id,
    entity: 'User',
    entityId: String(updated._id),
    meta: { actorUserId: req.authUser?.id, targetUserId: String(updated._id), role: updated.role }
  });
  ok(res, updated, 'User role updated');
});

r.post('/:id/reset-password', async (req, res) => {
  const body = z.object({ newPassword: passwordRule }).safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ success: false, message: 'Validation failed', fieldErrors: body.error.flatten().fieldErrors });
  }
  const user = await User.findById(req.params.id);
  if (!user) return fail(res, 404, 'User not found');

  user.passwordHash = await bcrypt.hash(body.data.newPassword, 10);
  user.resetToken = undefined;
  user.resetTokenExpiresAt = undefined;
  await user.save();

  await writeLog({
    action: 'USER_PASSWORD_RESET',
    eventName: 'USER_PASSWORD_RESET',
    userId: req.authUser?.id,
    entity: 'User',
    entityId: String(user._id),
    meta: { actorUserId: req.authUser?.id, targetUserId: String(user._id) }
  });

  ok(res, { userId: user._id, temporaryPassword: body.data.newPassword }, 'Password reset successful');
});

export default r;
