import { Router } from 'express';
import { z } from 'zod';
import { Item } from '../models/Item.js';
import { InventoryLog } from '../models/InventoryLog.js';
import { fail, ok } from '../utils/response.js';
import { requireAuth } from '../middleware/auth.js';
import { writeLog } from '../utils/log.js';

const r = Router();
r.use(requireAuth);

r.get('/items', async (_req, res) => {
  const items = await Item.find().lean();
  const logs = await InventoryLog.aggregate([{ $group: { _id: '$itemId', sum: { $sum: '$qtyChange' } } }]);
  const map = new Map(logs.map((l) => [String(l._id), l.sum as number]));
  const withStock = items.map((i) => ({ ...i, stock: i.baseQuantity + (map.get(String(i._id)) || 0) }));
  ok(res, withStock);
});

r.post('/items', async (req, res) => {
  const body = z.object({ sku: z.string(), name: z.string(), category: z.string(), supplierName: z.string().optional(), unitPrice: z.number(), baseQuantity: z.number(), reorderThreshold: z.number().optional() }).safeParse(req.body);
  if (!body.success) return fail(res, 400, body.error.message);
  const item = await Item.create(body.data);
  await writeLog({ action: 'CREATE_ITEM', userId: req.authUser?.id, entity: 'Item', entityId: String(item._id) });
  ok(res, item);
});

r.post('/logs', async (req, res) => {
  const body = z.object({ itemId: z.string(), qtyChange: z.number().int().refine((v) => v !== 0), type: z.enum(['RESTOCK', 'DEDUCTION', 'ADJUSTMENT']), reason: z.string() }).safeParse(req.body);
  if (!body.success) return fail(res, 400, body.error.message);
  const log = await InventoryLog.create({ ...body.data, createdBy: req.authUser?.id });
  await writeLog({ action: 'CREATE_INVENTORY_LOG', userId: req.authUser?.id, entity: 'InventoryLog', entityId: String(log._id) });
  ok(res, log);
});

r.get('/logs', async (_req, res) => ok(res, await InventoryLog.find().sort({ createdAt: -1 }).populate('itemId', 'name sku')));
r.delete('/logs/:id', async (_req, res) => fail(res, 405, 'Append-only: inventory logs cannot be deleted'));
r.put('/logs/:id', async (_req, res) => fail(res, 405, 'Append-only: inventory logs cannot be edited'));

export default r;
