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
    console.log('Auth middleware - Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const { data, error } = await supabase.auth.getUser(token);
    console.log('Auth middleware - Supabase response:', {
      hasData: !!data,
      hasUser: !!data?.user,
      userId: data?.user?.id,
      error: error?.message
    });
    
    if (error || !data.user || !data.user.id) {
      res.status(401).json({ error: 'Invalid token or missing user ID' });
      return;
    }
    
    // Assign user to request
    (req as any).user = data.user;
    console.log('Auth middleware - User assigned to request:', {
      userId: data.user.id,
      email: data.user.email
    });
    
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
