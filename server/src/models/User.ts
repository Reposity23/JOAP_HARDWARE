import { model, Schema, InferSchemaType } from 'mongoose';
import { baseOptions, roleEnum } from './common.js';

const userSchema = new Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: roleEnum, required: true },
    isActive: { type: Boolean, default: true, index: true },
    resetToken: String,
    resetTokenExpiresAt: Date
  },
  baseOptions
);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = model('User', userSchema);
