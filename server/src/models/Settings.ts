import { model, Schema } from 'mongoose';
import { baseOptions } from './common.js';

const settingsSchema = new Schema(
  {
    companyName: { type: String, default: 'JOAP Hardware Trading' },
    theme: { type: String, default: 'dark' },
    reorderThresholdDefault: { type: Number, default: 10 }
  },
  baseOptions
);
export const Settings = model('Settings', settingsSchema);
