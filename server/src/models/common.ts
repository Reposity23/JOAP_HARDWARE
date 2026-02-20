import { Schema } from 'mongoose';

export const baseOptions = { timestamps: true };
export const roleEnum = ['ADMIN', 'EMPLOYEE'] as const;
export const orderStatusEnum = ['Pending Payment', 'Ready Dispatch', 'In Transit', 'Completed'] as const;
