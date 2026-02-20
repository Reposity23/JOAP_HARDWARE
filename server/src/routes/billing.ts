import { Router } from 'express';
import { z } from 'zod';
import { BillingPayment } from '../models/BillingPayment.js';
import { Order } from '../models/Order.js';
import { requireAuth } from '../middleware/auth.js';
import { fail, ok } from '../utils/response.js';
import { writeLog } from '../utils/log.js';
import { AccountingAccount, GeneralLedgerEntry } from '../models/Accounting.js';

const r = Router();
r.use(requireAuth);

r.get('/', async (_req, res) => ok(res, await BillingPayment.find().populate('orderId').sort({ createdAt: -1 })));

r.post('/log', async (req, res) => {
  const body = z
    .object({ orderId: z.string(), gcashRef: z.string().regex(/^GC[0-9]{8,}$/), amountPaid: z.number().positive(), paymentDate: z.string() })
    .safeParse(req.body);
  if (!body.success) return fail(res, 400, body.error.message);
  const order = await Order.findById(body.data.orderId);
  if (!order) return fail(res, 404, 'Order not found');
  const paid = await BillingPayment.aggregate([{ $match: { orderId: order._id } }, { $group: { _id: null, sum: { $sum: '$amountPaid' } } }]);
  const currentPaid = paid[0]?.sum || 0;
  if (currentPaid + body.data.amountPaid > order.total) return fail(res, 400, 'Payment exceeds total');
  const payment = await BillingPayment.create({ ...body.data, paymentDate: new Date(body.data.paymentDate), createdBy: req.authUser?.id });
  const newPaid = currentPaid + body.data.amountPaid;
  if (newPaid >= order.total) {
    order.status = 'Ready Dispatch';
    order.statusHistory.push({ status: 'Ready Dispatch', note: 'Payment confirmed', at: new Date() });
    await order.save();
    const cash = await AccountingAccount.findOne({ code: '1010' });
    const sales = await AccountingAccount.findOne({ code: '4010' });
    if (cash && sales) {
      const groupId = `PAY-${payment._id}`;
      await GeneralLedgerEntry.insertMany([
        { groupId, accountId: cash._id, debit: payment.amountPaid, credit: 0, memo: 'Payment received', sourceType: 'Payment', sourceId: String(payment._id), createdBy: req.authUser?.id },
        { groupId, accountId: sales._id, debit: 0, credit: payment.amountPaid, memo: 'Sales revenue', sourceType: 'Payment', sourceId: String(payment._id), createdBy: req.authUser?.id }
      ]);
    }
  }
  await writeLog({ action: 'LOG_PAYMENT', userId: req.authUser?.id, entity: 'BillingPayment', entityId: String(payment._id) });
  ok(res, payment);
});

export default r;
