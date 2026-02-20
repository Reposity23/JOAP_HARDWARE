import { model, Schema } from 'mongoose';
import { baseOptions } from './common.js';

const inventoryLogSchema = new Schema(
  {
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
    qtyChange: { type: Number, required: true },
    type: { type: String, enum: ['RESTOCK', 'DEDUCTION', 'ADJUSTMENT'], required: true },
    reason: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  baseOptions
);
export const InventoryLog = model('InventoryLog', inventoryLogSchema);
