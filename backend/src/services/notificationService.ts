import { Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushReceiptId } from 'expo-server-sdk';
import { User } from '@/models/User';
import { logger } from '@/utils/logger';

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

export interface PushNotification extends NotificationData {
  to: string | string[];
  priority?: 'default' | 'normal' | 'high';
  ttl?: number;
  expiration?: number;
  collapseId?: string;
  categoryId?: string;
  mutableContent?: boolean;
}

class NotificationService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo({
      accessToken: process.env.EXPO_ACCESS_TOKEN,
      useFcmV1: true // Use FCM v1 API
    });
  }

  // Send push notification to a single user
  async sendToUser(userId: string, notification: NotificationData): Promise<boolean> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.pushToken) {
        logger.warn(`User ${userId} not found or no push token`);
        return false;
      }

      return await this.sendToToken(user.pushToken, notification);
    } catch (error) {
      logger.error('Error sending notification to user:', error);
      return false;
    }
  }

  // Send push notification to multiple users
  async sendToUsers(userIds: string[], notification: NotificationData): Promise<{ success: number; failed: number }> {
    try {
      const users = await User.find({ 
        _id: { $in: userIds },
        pushToken: { $exists: true, $ne: null }
      }).select('pushToken');

      const tokens = users.map(user => user.pushToken!);
      return await this.sendToTokens(tokens, notification);
    } catch (error) {
      logger.error('Error sending notifications to users:', error);
      return { success: 0, failed: userIds.length };
    }
  }

  // Send push notification to a single token
  async sendToToken(token: string, notification: NotificationData): Promise<boolean> {
    try {
      if (!Expo.isExpoPushToken(token)) {
        logger.warn(`Invalid Expo push token: ${token}`);
        return false;
      }

      const message: ExpoPushMessage = {
        to: token,
        sound: notification.sound || 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        badge: notification.badge,
        channelId: notification.channelId || 'default',
        priority: 'high',
        ttl: 3600 // 1 hour
      };

      const tickets = await this.expo.sendPushNotificationsAsync([message]);
      const ticket = tickets[0];

      if (ticket.status === 'error') {
        logger.error(`Error sending notification: ${ticket.message}`);
        return false;
      }

      logger.info(`Notification sent successfully to token: ${token.substring(0, 10)}...`);
      return true;
    } catch (error) {
      logger.error('Error sending notification to token:', error);
      return false;
    }
  }

  // Send push notifications to multiple tokens
  async sendToTokens(tokens: string[], notification: NotificationData): Promise<{ success: number; failed: number }> {
    try {
      const validTokens = tokens.filter(token => Expo.isExpoPushToken(token));
      
      if (validTokens.length === 0) {
        logger.warn('No valid Expo push tokens provided');
        return { success: 0, failed: tokens.length };
      }

      const messages: ExpoPushMessage[] = validTokens.map(token => ({
        to: token,
        sound: notification.sound || 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        badge: notification.badge,
        channelId: notification.channelId || 'default',
        priority: 'high',
        ttl: 3600 // 1 hour
      }));

      // Send notifications in chunks
      const chunks = this.expo.chunkPushNotifications(messages);
      let successCount = 0;
      let failedCount = 0;

      for (const chunk of chunks) {
        try {
          const tickets = await this.expo.sendPushNotificationsAsync(chunk);
          
          tickets.forEach(ticket => {
            if (ticket.status === 'ok') {
              successCount++;
            } else {
              failedCount++;
              logger.error(`Notification error: ${ticket.message}`);
            }
          });
        } catch (error) {
          logger.error('Error sending notification chunk:', error);
          failedCount += chunk.length;
        }
      }

      logger.info(`Notifications sent: ${successCount} success, ${failedCount} failed`);
      return { success: successCount, failed: failedCount };
    } catch (error) {
      logger.error('Error sending notifications to tokens:', error);
      return { success: 0, failed: tokens.length };
    }
  }

  // Send notification to users by role
  async sendToRole(role: string, notification: NotificationData): Promise<{ success: number; failed: number }> {
    try {
      const users = await User.find({ 
        role,
        pushToken: { $exists: true, $ne: null },
        isActive: true
      }).select('pushToken');

      const tokens = users.map(user => user.pushToken!);
      return await this.sendToTokens(tokens, notification);
    } catch (error) {
      logger.error('Error sending notifications to role:', error);
      return { success: 0, failed: 0 };
    }
  }

  // Send broadcast notification to all users
  async sendBroadcast(notification: NotificationData): Promise<{ success: number; failed: number }> {
    try {
      const users = await User.find({ 
        pushToken: { $exists: true, $ne: null },
        isActive: true
      }).select('pushToken');

      const tokens = users.map(user => user.pushToken!);
      return await this.sendToTokens(tokens, notification);
    } catch (error) {
      logger.error('Error sending broadcast notification:', error);
      return { success: 0, failed: 0 };
    }
  }

  // Handle push notification receipts
  async handleReceipts(receiptIds: ExpoPushReceiptId[]): Promise<void> {
    try {
      const receiptIdChunks = this.expo.chunkPushNotificationReceiptIds(receiptIds);
      
      for (const chunk of receiptIdChunks) {
        try {
          const receipts = await this.expo.getPushNotificationReceiptsAsync(chunk);
          
          for (const receiptId in receipts) {
            const receipt = receipts[receiptId];
            
            if (receipt.status === 'ok') {
              continue;
            } else if (receipt.status === 'error') {
              logger.error(`Notification receipt error: ${receipt.message}`);
              
              // Handle specific errors
              if (receipt.details && receipt.details.error) {
                const errorCode = receipt.details.error;
                
                if (errorCode === 'DeviceNotRegistered') {
                  // Remove invalid push token from user
                  logger.info(`Removing invalid push token for receipt: ${receiptId}`);
                  // You might want to implement token cleanup here
                }
              }
            }
          }
        } catch (error) {
          logger.error('Error handling receipt chunk:', error);
        }
      }
    } catch (error) {
      logger.error('Error handling push notification receipts:', error);
    }
  }

  // Predefined notification templates
  static templates = {
    orderConfirmed: (restaurantName: string): NotificationData => ({
      title: 'Order Confirmed! 🎉',
      body: `Your order from ${restaurantName} has been confirmed and is being prepared.`,
      channelId: 'orders',
      data: { type: 'order_update', status: 'confirmed' }
    }),

    orderReady: (restaurantName: string): NotificationData => ({
      title: 'Order Ready! 🍽️',
      body: `Your order from ${restaurantName} is ready for pickup.`,
      channelId: 'orders',
      data: { type: 'order_update', status: 'ready' }
    }),

    orderDelivered: (): NotificationData => ({
      title: 'Order Delivered! ✅',
      body: 'Your order has been delivered. Enjoy your meal!',
      channelId: 'orders',
      data: { type: 'order_update', status: 'delivered' }
    }),

    bookingConfirmed: (hotelName: string): NotificationData => ({
      title: 'Booking Confirmed! 🏨',
      body: `Your booking at ${hotelName} has been confirmed.`,
      channelId: 'bookings',
      data: { type: 'booking_update', status: 'confirmed' }
    }),

    paymentSuccessful: (amount: number): NotificationData => ({
      title: 'Payment Successful! 💳',
      body: `Your payment of GH₵${amount.toFixed(2)} has been processed successfully.`,
      channelId: 'payments',
      data: { type: 'payment_update', status: 'success' }
    }),

    newPromotion: (title: string, description: string): NotificationData => ({
      title: title,
      body: description,
      channelId: 'promotions',
      data: { type: 'promotion' }
    })
  };
}

// Export the class and singleton instance
export { NotificationService };
export const notificationService = new NotificationService();