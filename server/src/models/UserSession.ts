import { model, Schema } from 'mongoose';
import { baseOptions } from './common.js';

const userSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, unique: true },
    loginAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
    logoutAt: Date,
    active: { type: Boolean, default: true }
  },
  baseOptions
);

export const UserSession = model('UserSession', userSessionSchema);
