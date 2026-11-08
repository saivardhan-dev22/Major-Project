import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { dataStore } from '../db/dataStore.js';

export interface AuthRequest extends Request {
  user?: any;
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  let token = req.cookies?.accessToken;
  
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' });
    return;
  }

  try {
    const decoded: any = jwt.verify(token, config.jwtSecret);
    const user = await dataStore.users.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ success: false, message: 'User session invalid or expired' });
      return;
    }
    req.user = user;
    next();
  } catch (err: any) {
    res.status(403).json({ success: false, message: 'Invalid or expired authentication token' });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: `Forbidden: requires one of the following roles: [${allowedRoles.join(', ')}]` 
      });
      return;
    }
    next();
  };
}
