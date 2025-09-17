import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { ApiResponse } from '@/types';

// General rate limiter - more lenient for development
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || (process.env.NODE_ENV === 'development' ? '1000' : '100')), // Higher limit for development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for development on localhost
  skip: (req: Request) => {
    if (process.env.NODE_ENV === 'development') {
      const ip = req.ip || req.connection.remoteAddress;
      return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === '10.0.2.2';
    }
    return false;
  }
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

// Payment rate limiter
export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // limit each IP to 3 payment requests per minute
  message: {
    success: false,
    message: 'Too many payment attempts, please try again later.'
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 upload requests per minute
  message: {
    success: false,
    message: 'Too many upload attempts, please try again later.'
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

// Public API rate limiter - very lenient for public endpoints
export const publicApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 1000 : 200, // Very high limit for development
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting completely for development
  skip: (req: Request) => {
    return process.env.NODE_ENV === 'development';
  }
});