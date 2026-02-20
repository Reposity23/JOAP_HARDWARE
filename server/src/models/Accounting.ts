import { model, Schema } from 'mongoose';
import { baseOptions } from './common.js';

const accountingAccountSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'], required: true }
  },
  baseOptions
);

const generalLedgerEntrySchema = new Schema(
  {
    groupId: { type: String, required: true, index: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'AccountingAccount', required: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    memo: String,
    sourceType: String,
    sourceId: String,
    reversedFromGroupId: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  baseOptions
);

export const AccountingAccount = model('AccountingAccount', accountingAccountSchema);
export const GeneralLedgerEntry = model('GeneralLedgerEntry', generalLedgerEntrySchema);
