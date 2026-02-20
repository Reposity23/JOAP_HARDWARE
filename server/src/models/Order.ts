import { model, Schema } from 'mongoose';
import { baseOptions, orderStatusEnum } from './common.js';

const orderItemSchema = new Schema({
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  qty: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  lineTotal: { type: Number, required: true }
});

const orderStatusEventSchema = new Schema({
  status: { type: String, enum: orderStatusEnum, required: true },
  note: String,
  at: { type: Date, default: Date.now }
});

const orderSchema = new Schema(
  {
    trackingNo: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    sourceChannel: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: orderStatusEnum, default: 'Pending Payment' },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    statusHistory: [orderStatusEventSchema]
  },
  baseOptions
);
export const Order = model('Order', orderSchema);
