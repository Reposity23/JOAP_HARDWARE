import { Response } from 'express';

export const ok = (res: Response, data: unknown, message = 'ok') => res.json({ success: true, message, data });
export const fail = (res: Response, status: number, message: string) =>
  res.status(status).json({ success: false, message });
