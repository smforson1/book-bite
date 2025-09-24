import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { ApiResponse } from '@/types';

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  } as ApiResponse,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  } as ApiResponse,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 upload requests per windowMs
  message: {
    success: false,
    message: 'Too many upload requests, please try again later.',
  } as ApiResponse,
});

// Public API rate limiter (for endpoints that don't require authentication)
export const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for public endpoints
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  } as ApiResponse,
});

// Payment rate limiter (stricter for payment endpoints)
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Very strict limit for payment attempts
  message: {
    success: false,
    message: 'Too many payment attempts, please try again later.',
  } as ApiResponse,
});

// Search rate limiter
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: {
    success: false,
    message: 'Too many search requests, please slow down.',
  } as ApiResponse,
});