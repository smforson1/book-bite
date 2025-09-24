import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiResponse } from '@/types';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? (error as any).value : undefined
    }));

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    } as ApiResponse);
    return;
  }

  next();
};

// Legacy function name for backward compatibility
export const handleValidationErrors = validateRequest;