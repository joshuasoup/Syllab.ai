// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { User } from '@supabase/supabase-js';
import supabase from '../lib/supabase';

// Enhanced interface that guarantees user.id exists
export interface AuthenticatedRequest extends Request {
  user: User & { id: string }; // Override with required id
  file?: any;
}

// Also add the global augmentation for future code
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user || !data.user.id) {
      res.status(401).json({ error: 'Invalid token or missing user ID' });
      return;
    }
    
    // Assign user to request
    (req as any).user = data.user;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const preventCrossUserDataAccess = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (resourceUserId && resourceUserId !== req.user.id) {
    res.status(403).json({ error: 'Not authorized to access this resource' });
    return;
  }
  
  next();
};
