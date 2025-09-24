import mongoose from 'mongoose';
import { logger } from '@/utils/logger';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookbite';
    
    const conn = await mongoose.connect(mongoURI, {
      // Remove deprecated options
      // useNewUrlParser and useUnifiedTopology are now default
    });

    logger.info(`🍃 MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📊 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        logger.error('Error during MongoDB disconnection:', err);
        process.exit(1);
      }
    });

  } catch (error: any) {
    logger.error('MongoDB connection failed:', error.message);
    
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;