import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyAccessToken } from '@/utils/jwt';
import { User } from '@/models/User';
import { logger } from '@/utils/logger';
import { SocketEvents } from '@/types';

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:3001",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.userId);

        if (!user || !user.isActive) {
          return next(new Error('Invalid user'));
        }

        socket.data.user = user;
        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      const user = socket.data.user;
      logger.info(`User ${user.email} connected with socket ${socket.id}`);

      // Store user connection
      this.connectedUsers.set(user._id.toString(), socket.id);

      // Join user to their personal room
      socket.join(`user_${user._id}`);

      // Join role-based rooms
      socket.join(`role_${user.role}`);

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`User ${user.email} disconnected`);
        this.connectedUsers.delete(user._id.toString());
      });

      // Handle joining order room (for order tracking)
      socket.on('join_order', (orderId: string) => {
        socket.join(`order_${orderId}`);
        logger.info(`User ${user.email} joined order room: ${orderId}`);
      });

      // Handle leaving order room
      socket.on('leave_order', (orderId: string) => {
        socket.leave(`order_${orderId}`);
        logger.info(`User ${user.email} left order room: ${orderId}`);
      });

      // Handle joining booking room
      socket.on('join_booking', (bookingId: string) => {
        socket.join(`booking_${bookingId}`);
        logger.info(`User ${user.email} joined booking room: ${bookingId}`);
      });

      // Handle leaving booking room
      socket.on('leave_booking', (bookingId: string) => {
        socket.leave(`booking_${bookingId}`);
        logger.info(`User ${user.email} left booking room: ${bookingId}`);
      });

      // Handle driver location updates (for delivery tracking)
      socket.on('driver_location_update', (data: { orderId: string; location: { latitude: number; longitude: number } }) => {
        this.emitDriverLocation(data.orderId, data.location);
      });
    });
  }

  // Emit order status update
  public emitOrderUpdate(orderId: string, status: string, estimatedTime?: Date): void {
    const eventData: SocketEvents['order_update'] = {
      orderId,
      status,
      estimatedTime
    };

    this.io.to(`order_${orderId}`).emit('order_update', eventData);
    logger.info(`Order update emitted for order ${orderId}: ${status}`);
  }

  // Emit booking status update
  public emitBookingUpdate(bookingId: string, status: string): void {
    const eventData: SocketEvents['booking_update'] = {
      bookingId,
      status
    };

    this.io.to(`booking_${bookingId}`).emit('booking_update', eventData);
    logger.info(`Booking update emitted for booking ${bookingId}: ${status}`);
  }

  // Emit driver location update
  public emitDriverLocation(orderId: string, location: { latitude: number; longitude: number }): void {
    const eventData: SocketEvents['driver_location'] = {
      orderId,
      location
    };

    this.io.to(`order_${orderId}`).emit('driver_location', eventData);
  }

  // Emit menu item availability update
  public emitMenuUpdate(restaurantId: string, menuItemId: string, isAvailable: boolean): void {
    const eventData: SocketEvents['menu_update'] = {
      restaurantId,
      menuItemId,
      isAvailable
    };

    this.io.to(`role_restaurant_owner`).emit('menu_update', eventData);
    this.io.emit('menu_update', eventData); // Broadcast to all users
  }

  // Emit room availability update
  public emitRoomUpdate(hotelId: string, roomId: string, isAvailable: boolean): void {
    const eventData: SocketEvents['room_update'] = {
      hotelId,
      roomId,
      isAvailable
    };

    this.io.to(`role_hotel_owner`).emit('room_update', eventData);
    this.io.emit('room_update', eventData); // Broadcast to all users
  }

  // Send notification to specific user
  public sendNotificationToUser(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ): void {
    const eventData: SocketEvents['notification'] = {
      userId,
      title,
      message,
      type
    };

    this.io.to(`user_${userId}`).emit('notification', eventData);
    logger.info(`Notification sent to user ${userId}: ${title}`);
  }

  // Send notification to role
  public sendNotificationToRole(
    role: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ): void {
    const eventData: SocketEvents['notification'] = {
      userId: '', // Not specific to a user
      title,
      message,
      type
    };

    this.io.to(`role_${role}`).emit('notification', eventData);
    logger.info(`Notification sent to role ${role}: ${title}`);
  }

  // Broadcast notification to all users
  public broadcastNotification(
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ): void {
    const eventData: SocketEvents['notification'] = {
      userId: '',
      title,
      message,
      type
    };

    this.io.emit('notification', eventData);
    logger.info(`Broadcast notification: ${title}`);
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Check if user is online
  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Get socket instance
  public getIO(): SocketIOServer {
    return this.io;
  }
}

// Singleton instance
let socketService: SocketService;

export const initializeSocketService = (server: HTTPServer): SocketService => {
  if (!socketService) {
    socketService = new SocketService(server);
  }
  return socketService;
};

export const getSocketService = (): SocketService => {
  if (!socketService) {
    throw new Error('Socket service not initialized');
  }
  return socketService;
};