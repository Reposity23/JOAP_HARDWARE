import { model, Schema } from 'mongoose';
import { baseOptions } from './common.js';

const itemSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    supplierName: String,
    unitPrice: { type: Number, required: true },
    baseQuantity: { type: Number, default: 0 },
    reorderThreshold: { type: Number, default: 10 }
  },
  baseOptions
);
export const Item = model('Item', itemSchema);
