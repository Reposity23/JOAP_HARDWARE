import { model, Schema } from 'mongoose';
import { baseOptions } from './common.js';

const systemLogSchema = new Schema(
  {
    action: { type: String, required: true, index: true },
    eventName: { type: String, index: true },
    entity: String,
    entityId: String,
    message: String,
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    meta: Schema.Types.Mixed,
    type: { type: String, default: 'audit' }
  },
  baseOptions
);

export const SystemLog = model('SystemLog', systemLogSchema);
