import { Router } from 'express';
import multer from 'multer';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Customer } from '../models/Customer.js';
import { Item } from '../models/Item.js';
import { Order } from '../models/Order.js';
import { BillingPayment } from '../models/BillingPayment.js';
import { InventoryLog } from '../models/InventoryLog.js';
import { SystemLog } from '../models/SystemLog.js';

const upload = multer();
const r = Router();
r.use(requireAuth, requireRole(['ADMIN']));

r.get('/backup', async (_req, res) => {
  const data = {
    users: await User.find().lean(),
    customers: await Customer.find().lean(),
    items: await Item.find().lean(),
    orders: await Order.find().lean(),
    payments: await BillingPayment.find().lean(),
    logs: await InventoryLog.find().lean()
  };
  await SystemLog.create({ action: 'BACKUP', message: 'Backup downloaded' });
  res.attachment('backup.json');
  res.json(data);
});

r.post('/restore', upload.single('file'), async (req, res) => {
  const parsed = JSON.parse(req.file?.buffer.toString() || '{}');
  if (!parsed.items || !parsed.orders) return res.status(400).json({ success: false, message: 'Invalid backup file' });
  await Item.deleteMany({});
  await Order.deleteMany({});
  await Item.insertMany(parsed.items);
  await Order.insertMany(parsed.orders);
  await SystemLog.create({ action: 'RESTORE', message: 'Restore completed' });
  res.json({ success: true });
});

export default r;
