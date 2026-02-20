import { model, Schema } from 'mongoose';
import { baseOptions } from './common.js';

const customerSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    phone: String,
    email: String,
    address: String
  },
  baseOptions
);
export const Customer = model('Customer', customerSchema);
