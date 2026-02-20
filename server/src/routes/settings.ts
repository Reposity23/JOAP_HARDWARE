import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Settings } from '../models/Settings.js';
import { fail, ok } from '../utils/response.js';

const r = Router();
r.use(requireAuth);
r.get('/', async (_req, res) => ok(res, (await Settings.findOne()) || (await Settings.create({}))));
r.put('/', requireRole(['ADMIN']), async (req, res) => {
  const body = z.object({ companyName: z.string(), theme: z.string(), reorderThresholdDefault: z.number() }).safeParse(req.body);
  if (!body.success) return fail(res, 400, body.error.message);
  const s = (await Settings.findOne()) || (await Settings.create({}));
  Object.assign(s, body.data);
  await s.save();
  ok(res, s);
});
export default r;
