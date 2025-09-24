import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/jwt';
import { User } from '@/models/User';
import { AuthenticatedRequest, ApiResponse } from '@/types';
import { logger } from '@/utils/logger';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token is required'
      } as ApiResponse);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = verifyAccessToken(token);
      
      // Get user from database
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Invalid or inactive user'
        } as ApiResponse);
        return;
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (tokenError) {
      logger.warn('Token verification failed:', tokenError);
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      } as ApiResponse);
      return;
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    } as ApiResponse);
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      } as ApiResponse);
      return;
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      next();
      return;
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (tokenError) {
      // Invalid token, but continue without authentication
      logger.warn('Optional auth token verification failed:', tokenError);
    }

    next();
  } catch (error) {
    logger.error('Optional authentication middleware error:', error);
    next(); // Continue even if there's an error
  }
};