import { Router } from 'express';
import { z } from 'zod';
import { Order } from '../models/Order.js';
import { requireAuth } from '../middleware/auth.js';
import { fail, ok } from '../utils/response.js';
import { writeLog } from '../utils/log.js';

const r = Router();
r.use(requireAuth);

r.get('/', async (_req, res) => ok(res, await Order.find().populate('customerId', 'name').sort({ createdAt: -1 })));

r.post('/', async (req, res) => {
  const body = z
    .object({
      customerId: z.string(),
      sourceChannel: z.string(),
      items: z.array(z.object({ itemId: z.string(), qty: z.number().positive(), unitPrice: z.number().positive() })).min(1)
    })
    .safeParse(req.body);
  if (!body.success) return fail(res, 400, body.error.message);
  const trackingNo = `JOAP-${Date.now()}`;
  const items = body.data.items.map((it) => ({ ...it, lineTotal: it.qty * it.unitPrice }));
  const total = items.reduce((a, b) => a + b.lineTotal, 0);
  const order = await Order.create({
    ...body.data,
    trackingNo,
    items,
    total,
    createdBy: req.authUser?.id,
    statusHistory: [{ status: 'Pending Payment', note: 'Order created' }]
  });
  await writeLog({ action: 'CREATE_ORDER', userId: req.authUser?.id, entity: 'Order', entityId: String(order._id) });
  ok(res, order);
});

r.post('/:id/status', async (req, res) => {
  const body = z.object({ status: z.enum(['Pending Payment', 'Ready Dispatch', 'In Transit', 'Completed']), note: z.string().optional() }).safeParse(req.body);
  if (!body.success) return fail(res, 400, body.error.message);
  const order = await Order.findById(req.params.id);
  if (!order) return fail(res, 404, 'Order not found');
  order.status = body.data.status;
  order.statusHistory.push({ status: body.data.status, note: body.data.note, at: new Date() });
  await order.save();
  ok(res, order);
});

r.delete('/:id', async (_req, res) => fail(res, 405, 'Append-only: orders cannot be deleted'));

export default r;
