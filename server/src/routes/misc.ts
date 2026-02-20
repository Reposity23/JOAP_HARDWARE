import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Customer } from '../models/Customer.js';
import { SystemLog } from '../models/SystemLog.js';
import { ok } from '../utils/response.js';

const r = Router();
r.use(requireAuth);

r.get('/customers', async (_req, res) => ok(res, await Customer.find()));
r.post('/feedback', async (req, res) => {
  await SystemLog.create({ action: 'FEEDBACK', type: 'feedback', message: req.body.message, userId: req.authUser?.id });
  ok(res, null);
});
r.get('/logs', requireRole(['ADMIN']), async (_req, res) => ok(res, await SystemLog.find().sort({ createdAt: -1 }).limit(300)));

export default r;
