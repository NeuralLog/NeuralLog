import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    tenantId: string;
    email: string;
    role: string;
  };
  tenantId?: string;
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authorization header required',
        code: 'MISSING_AUTH_HEADER'
      });
    }

    if (!tenantId) {
      return res.status(400).json({
        error: 'X-Tenant-ID header required',
        code: 'MISSING_TENANT_ID'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET environment variable not set');
      return res.status(500).json({
        error: 'Server configuration error',
        code: 'MISSING_JWT_SECRET'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      
      // Verify tenant access
      if (decoded.tenantId !== tenantId) {
        return res.status(403).json({
          error: 'Access denied to this tenant',
          code: 'TENANT_ACCESS_DENIED'
        });
      }

      req.user = {
        id: decoded.sub || decoded.userId,
        tenantId: decoded.tenantId,
        email: decoded.email,
        role: decoded.role || 'user'
      };
      req.tenantId = tenantId;

      next();
    } catch (jwtError) {
      logger.warn('Invalid JWT token:', jwtError);
      return res.status(401).json({
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

export const adminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'owner') {
    return res.status(403).json({
      error: 'Admin access required',
      code: 'ADMIN_ACCESS_REQUIRED'
    });
  }

  next();
};
