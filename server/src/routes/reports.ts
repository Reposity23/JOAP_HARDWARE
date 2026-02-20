import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { InventoryLog } from '../models/InventoryLog.js';
import { Order } from '../models/Order.js';
import { GeneralLedgerEntry } from '../models/Accounting.js';
import { ok } from '../utils/response.js';
import { stringify } from 'csv-stringify/sync';
import PDFDocument from 'pdfkit';

const r = Router();
r.use(requireAuth);

r.get('/summary', async (_req, res) => {
  const revenue = await GeneralLedgerEntry.aggregate([{ $group: { _id: null, credit: { $sum: '$credit' }, debit: { $sum: '$debit' } } }]);
  const rev = revenue[0]?.credit || 0;
  const exp = revenue[0]?.debit || 0;
  ok(res, { totalRevenue: rev, totalExpenses: exp, netProfit: rev - exp });
});

r.get('/sales-forecast', async (_req, res) => {
  const byDay = await Order.aggregate([{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$total' } } }, { $sort: { _id: 1 } }]);
  const series = byDay.map((x) => x.total);
  const avgDelta = series.length > 1 ? series.slice(1).reduce((a, v, i) => a + (v - series[i]), 0) / (series.length - 1) : 0;
  const last = series.at(-1) || 0;
  const forecast = Array.from({ length: 7 }).map((_, i) => Math.max(0, Math.round(last + avgDelta * (i + 1))));
  ok(res, { history: byDay, forecast });
});

r.get('/inventory.csv', async (_req, res) => {
  const rows = await InventoryLog.find().lean();
  const csv = stringify(rows, { header: true });
  res.header('Content-Type', 'text/csv');
  res.attachment('inventory_logs.csv');
  res.send(csv);
});

r.get('/financial.pdf', async (_req, res) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=financial-report.pdf');
  const doc = new PDFDocument();
  doc.pipe(res);
  doc.fontSize(18).text('JOAP Financial Report');
  const rows = await GeneralLedgerEntry.find().populate('accountId');
  rows.forEach((r) => doc.fontSize(10).text(`${r.groupId} | D:${r.debit} C:${r.credit}`));
  doc.end();
});

export default r;
