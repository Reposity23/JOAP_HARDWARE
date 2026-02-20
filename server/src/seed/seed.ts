import bcrypt from 'bcryptjs';
import { connectDb } from '../config/db.js';
import { User } from '../models/User.js';
import { Customer } from '../models/Customer.js';
import { Item } from '../models/Item.js';
import { AccountingAccount } from '../models/Accounting.js';

await connectDb();
if (!(await User.findOne({ username: 'admin' }))) {
  await User.create({ fullName: 'System Admin', username: 'admin', passwordHash: await bcrypt.hash('admin123', 10), role: 'ADMIN', isActive: true });
}
if ((await Customer.countDocuments()) === 0) {
  await Customer.insertMany([
    { name: 'Juan Dela Cruz', phone: '09171231234' },
    { name: 'Acme Builders', email: 'acme@test.com' }
  ]);
}
if ((await Item.countDocuments()) === 0) {
  await Item.insertMany([
    { sku: 'ITM-001', name: 'Cement 40kg', category: 'Construction', supplierName: 'ABC Supply', unitPrice: 260, baseQuantity: 40, reorderThreshold: 10 },
    { sku: 'ITM-002', name: 'PVC Pipe 1in', category: 'Plumbing', supplierName: 'PipeCo', unitPrice: 90, baseQuantity: 70, reorderThreshold: 20 }
  ]);
}
if ((await AccountingAccount.countDocuments()) === 0) {
  await AccountingAccount.insertMany([
    { code: '1010', name: 'Cash/GCash', type: 'ASSET' },
    { code: '4010', name: 'Sales Revenue', type: 'REVENUE' },
    { code: '5010', name: 'Operating Expense', type: 'EXPENSE' }
  ]);
}
console.log('Seed complete. admin/admin123');
process.exit(0);
