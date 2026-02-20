import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { fail } from '../utils/response.js';
import { UserSession } from '../models/UserSession.js';

const JWT_SECRET = 'joap-secret';

export type AuthUser = { id: string; role: 'ADMIN' | 'EMPLOYEE' };

declare module 'express-serve-static-core' {
  interface Request {
    authUser?: AuthUser;
    token?: string;
  }
}

export const signToken = (payload: AuthUser) => jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return fail(res, 401, 'Missing token');
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    const session = await UserSession.findOne({ token, active: true });
    if (!session) return fail(res, 401, 'Session expired');
    session.lastActivityAt = new Date();
    await session.save();
    req.authUser = decoded;
    req.token = token;
    next();
  } catch {
    return fail(res, 401, 'Invalid token');
  }
};

export const requireRole = (roles: Array<'ADMIN' | 'EMPLOYEE'>) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.authUser || !roles.includes(req.authUser.role)) return fail(res, 403, 'Forbidden');
  next();
};
