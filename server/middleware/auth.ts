import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types';

// Get JWT secret from environment or use default
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Extend the Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        firstName: string;
        lastName: string;
      };
    }
  }
}

// Authenticate JWT token
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        error: 'No authorization header' 
      });
    }

    // Check if it's a Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid authorization header format' 
      });
    }

    const token = parts[1];
    
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: UserRole;
      firstName: string;
      lastName: string;
    };
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token expired' 
      });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: 'Authentication error' 
    });
  }
};

// Role-based middleware functions remain the same
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== UserRole.ADMIN) {
    return res.status(403).json({ 
      success: false, 
      error: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

export const isDoctor = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== UserRole.DOCTOR) {
    return res.status(403).json({ 
      success: false, 
      error: 'Access denied. Doctor privileges required.' 
    });
  }
  next();
};

export const isAdminOrDoctor = (req: Request, res: Response, next: NextFunction) => {
  if (
    req.user?.role !== UserRole.ADMIN && 
    req.user?.role !== UserRole.DOCTOR
  ) {
    return res.status(403).json({ 
      success: false, 
      error: 'Access denied. Admin or doctor privileges required.' 
    });
  }
  next();
};

export const isAdminOrSelf = (idParam: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (
      req.user?.role !== UserRole.ADMIN && 
      req.user?.id !== req.params[idParam]
    ) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied. You can only access your own resources.' 
      });
    }
    next();
  };
};