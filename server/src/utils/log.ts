import { SystemLog } from '../models/SystemLog.js';

export const writeLog = async (args: {
  action: string;
  eventName?: string;
  userId?: string;
  entity?: string;
  entityId?: string;
  message?: string;
  meta?: unknown;
  type?: string;
}) => {
  await SystemLog.create(args);
};
