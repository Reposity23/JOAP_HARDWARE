import { model, Schema } from 'mongoose';
import { baseOptions } from './common.js';

const billingPaymentSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    gcashRef: { type: String, required: true, unique: true },
    amountPaid: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  baseOptions
);
export const BillingPayment = model('BillingPayment', billingPaymentSchema);
