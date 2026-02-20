import { Router } from 'express';
import { z } from 'zod';
import { AccountingAccount, GeneralLedgerEntry } from '../models/Accounting.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { fail, ok } from '../utils/response.js';

const r = Router();
r.use(requireAuth);

r.get('/accounts', async (_req, res) => ok(res, await AccountingAccount.find().sort({ code: 1 })));
r.get('/ledger', async (_req, res) => ok(res, await GeneralLedgerEntry.find().populate('accountId').sort({ createdAt: -1 })));

r.post('/expense', requireRole(['ADMIN']), async (req, res) => {
  const body = z.object({ expenseAccountId: z.string(), cashAccountId: z.string(), amount: z.number().positive(), memo: z.string() }).safeParse(req.body);
  if (!body.success) return fail(res, 400, body.error.message);
  const groupId = `EXP-${Date.now()}`;
  const entries = await GeneralLedgerEntry.insertMany([
    { groupId, accountId: body.data.expenseAccountId, debit: body.data.amount, credit: 0, memo: body.data.memo, createdBy: req.authUser?.id },
    { groupId, accountId: body.data.cashAccountId, debit: 0, credit: body.data.amount, memo: body.data.memo, createdBy: req.authUser?.id }
  ]);
  ok(res, entries);
});

r.post('/reverse/:groupId', requireRole(['ADMIN']), async (req, res) => {
  const rows = await GeneralLedgerEntry.find({ groupId: req.params.groupId });
  if (!rows.length) return fail(res, 404, 'Group not found');
  const reverseGroupId = `REV-${req.params.groupId}-${Date.now()}`;
  const reverse = rows.map((r) => ({
    groupId: reverseGroupId,
    accountId: r.accountId,
    debit: r.credit,
    credit: r.debit,
    memo: `Reversing ${r.groupId}`,
    reversedFromGroupId: r.groupId,
    createdBy: req.authUser?.id
  }));
  ok(res, await GeneralLedgerEntry.insertMany(reverse));
});

r.put('/ledger/:id', async (_req, res) => fail(res, 405, 'Append-only: ledger entries cannot be edited'));
r.delete('/ledger/:id', async (_req, res) => fail(res, 405, 'Append-only: ledger entries cannot be deleted'));

export default r;
