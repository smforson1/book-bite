import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import connectDB from '@/config/database';
import { logger, morganStream } from '@/utils/logger';
import { errorHandler, notFound } from '@/middleware/errorHandler';
import { generalLimiter } from '@/middleware/rateLimiter';
import { initializeSocketService } from '@/services/socketService';

// Import routes
import authRoutes from '@/routes/auth';
import hotelRoutes from '@/routes/hotels';
import roomRoutes from '@/routes/rooms';
import bookingRoutes from '@/routes/bookings';
import restaurantRoutes from '@/routes/restaurants';
import menuItemRoutes from '@/routes/menuItems';
import orderRoutes from '@/routes/orders';
import uploadRoutes from '@/routes/upload';

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const socketService = initializeSocketService(server);

// Connect to database
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  const morgan = require('morgan');
  app.use(morgan('combined', { stream: morganStream }));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Book Bite API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// API routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/hotels`, hotelRoutes);
app.use(`/api/${API_VERSION}/rooms`, roomRoutes);
app.use(`/api/${API_VERSION}/bookings`, bookingRoutes);
app.use(`/api/${API_VERSION}/restaurants`, restaurantRoutes);
app.use(`/api/${API_VERSION}/menu-items`, menuItemRoutes);
app.use(`/api/${API_VERSION}/orders`, orderRoutes);
app.use(`/api/${API_VERSION}/upload`, uploadRoutes);

// Socket.IO status endpoint
app.get('/api/socket/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Socket service status',
    data: {
      connectedUsers: socketService.getConnectedUsersCount(),
      isRunning: true
    }
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Start server
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    logger.info(`🚀 Book Bite API Server running on port ${PORT}`);
    logger.info(`📱 Environment: ${process.env.NODE_ENV}`);
    logger.info(`🔗 API Base URL: http://localhost:${PORT}/api/${API_VERSION}`);
    logger.info(`🔌 Socket.IO running on port ${PORT}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export { app, server };