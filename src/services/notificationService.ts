import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './apiService';

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  type: 'booking' | 'order' | 'payment' | 'promotion' | 'general';
  priority?: 'low' | 'normal' | 'high';
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  title: string;
  options?: {
    opensAppToForeground?: boolean;
  };
}

export interface LocalNotification extends NotificationData {
  id: string;
  scheduledFor?: Date;
  isRead: boolean;
  createdAt: Date;
}

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const notificationData = notification.request.content.data as { type?: string };
    
    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: notificationData?.type === 'order' || notificationData?.type === 'payment' 
        ? Notifications.AndroidNotificationPriority.HIGH
        : Notifications.AndroidNotificationPriority.DEFAULT,
    };
  },
});

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  async initialize(): Promise<boolean> {
    try {
      // Register for push notifications
      const token = await this.registerForPushNotifications();
      if (token) {
        this.expoPushToken = token;
        // Send token to backend
        await this.sendTokenToBackend(token);
      }

      // Set up notification listeners
      this.setupNotificationListeners();
      
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  private async registerForPushNotifications(): Promise<string | null> {
    let token: string | null = null;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
      }

      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push notification token:', token);
    } else {
      console.warn('Must use physical device for Push Notifications');
    }

    // Configure notification channels for Android
    if (Platform.OS === 'android') {
      await this.setupAndroidNotificationChannels();
    }

    return token;
  }

  private async setupAndroidNotificationChannels(): Promise<void> {
    // Create notification channels for different types
    await Notifications.setNotificationChannelAsync('booking', {
      name: 'Booking Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('order', {
      name: 'Order Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('payment', {
      name: 'Payment Updates',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('promotion', {
      name: 'Promotions & Offers',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('general', {
      name: 'General Notifications',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });
  }

  private setupNotificationListeners(): void {
    // Listener for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listener for when user taps notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  private async handleNotificationReceived(notification: Notifications.Notification): Promise<void> {
    // Store notification locally
    const localNotification: LocalNotification = {
      id: notification.request.identifier,
      title: notification.request.content.title || '',
      body: notification.request.content.body || '',
      data: notification.request.content.data,
      type: (notification.request.content.data?.type as any) || 'general',
      isRead: false,
      createdAt: new Date(),
    };

    await this.saveLocalNotification(localNotification);
    
    // Update badge count
    await this.updateBadgeCount();
  }

  private async handleNotificationResponse(response: Notifications.NotificationResponse): Promise<void> {
    const data = response.notification.request.content.data;
    
    // Mark notification as read
    await this.markNotificationAsRead(response.notification.request.identifier);
    
    // Handle navigation based on notification type
    if (data?.type === 'booking' && data?.bookingId) {
      // Navigate to booking details
      // This would be handled by your navigation service
      console.log('Navigate to booking:', data.bookingId);
    } else if (data?.type === 'order' && data?.orderId) {
      // Navigate to order details
      console.log('Navigate to order:', data.orderId);
    } else if (data?.type === 'payment' && data?.transactionId) {
      // Navigate to payment details
      console.log('Navigate to payment:', data.transactionId);
    }
  }

  // Send booking notification
  async sendBookingNotification(data: {
    bookingId: string;
    userId: string;
    hotelId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
  }): Promise<void> {
    try {
      const notificationData: NotificationData = {
        title: data.title,
        body: data.message,
        type: 'booking',
        data: {
          bookingId: data.bookingId,
          hotelId: data.hotelId,
          ...data.data
        },
        priority: 'high'
      };
      
      await this.sendLocalNotification(notificationData);
      
      // Also try to send push notification if user has token
      if (this.expoPushToken) {
        await this.sendPushNotification(this.expoPushToken, notificationData);
      }
    } catch (error) {
      console.error('Error sending booking notification:', error);
    }
  }

  // Send order notification
  async sendOrderNotification(data: {
    orderId: string;
    userId: string;
    restaurantId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
  }): Promise<void> {
    try {
      const notificationData: NotificationData = {
        title: data.title,
        body: data.message,
        type: 'order',
        data: {
          orderId: data.orderId,
          restaurantId: data.restaurantId,
          ...data.data
        },
        priority: 'high'
      };
      
      await this.sendLocalNotification(notificationData);
      
      // Also try to send push notification if user has token
      if (this.expoPushToken) {
        await this.sendPushNotification(this.expoPushToken, notificationData);
      }
    } catch (error) {
      console.error('Error sending order notification:', error);
    }
  }

  private async sendPushNotification(token: string, notificationData: NotificationData): Promise<void> {
    // Push notification implementation would go here
    // For now, this is a placeholder
    console.log('Push notification would be sent:', { token, notificationData });
  }

  private async sendLocalNotification(notificationData: NotificationData & { scheduledFor?: Date }): Promise<string> {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data || {},
      },
      trigger: notificationData.scheduledFor ? null : null,
    });

    // Save to local storage
    const localNotification: LocalNotification = {
      id: identifier,
      ...notificationData,
      isRead: false,
      createdAt: new Date(),
    };

    await this.saveLocalNotification(localNotification);
    return identifier;
  }

  async scheduleNotification(notificationData: NotificationData, scheduledFor: Date): Promise<string> {
    return this.sendLocalNotification({
      ...notificationData,
      scheduledFor,
    });
  }

  // Booking-specific notifications
  async sendBookingConfirmation(bookingId: string, hotelName: string, checkIn: Date): Promise<void> {
    await this.sendLocalNotification({
      title: 'Booking Confirmed! 🎉',
      body: `Your booking at ${hotelName} has been confirmed. Check-in: ${checkIn.toLocaleDateString()}`,
      type: 'booking',
      data: { bookingId, type: 'booking_confirmed' },
      priority: 'high',
    });
  }

  async sendBookingReminder(bookingId: string, hotelName: string, checkIn: Date): Promise<void> {
    // Schedule reminder 1 day before check-in
    const reminderDate = new Date(checkIn.getTime() - 24 * 60 * 60 * 1000);
    
    if (reminderDate > new Date()) {
      await this.scheduleNotification({
        title: 'Check-in Tomorrow 📅',
        body: `Don't forget! You have a booking at ${hotelName} tomorrow.`,
        type: 'booking',
        data: { bookingId, type: 'booking_reminder' },
        priority: 'normal',
      }, reminderDate);
    }
  }

  // Order-specific notifications
  async sendOrderConfirmation(orderId: string, restaurantName: string, estimatedTime: string): Promise<void> {
    await this.sendLocalNotification({
      title: 'Order Confirmed! 🍽️',
      body: `Your order from ${restaurantName} has been confirmed. Estimated delivery: ${estimatedTime}`,
      type: 'order',
      data: { orderId, type: 'order_confirmed' },
      priority: 'high',
    });
  }

  async sendOrderStatusUpdate(orderId: string, status: string, restaurantName: string): Promise<void> {
    const statusMessages = {
      preparing: `Your order from ${restaurantName} is being prepared 👨‍🍳`,
      ready: `Your order from ${restaurantName} is ready for pickup/delivery! 🚚`,
      out_for_delivery: `Your order is out for delivery! It should arrive soon 🏃‍♂️`,
      delivered: `Your order has been delivered! Enjoy your meal! 😋`,
    };

    const message = statusMessages[status as keyof typeof statusMessages] || 
                   `Your order status has been updated to: ${status}`;

    await this.sendLocalNotification({
      title: 'Order Update',
      body: message,
      type: 'order',
      data: { orderId, status, type: 'order_status_update' },
      priority: 'high',
    });
  }

  // Payment notifications
  async sendPaymentConfirmation(transactionId: string, amount: number, currency: string): Promise<void> {
    await this.sendLocalNotification({
      title: 'Payment Successful! ✅',
      body: `Your payment of ${currency} ${amount.toFixed(2)} has been processed successfully.`,
      type: 'payment',
      data: { transactionId, type: 'payment_confirmed' },
      priority: 'high',
    });
  }

  async sendPaymentFailed(transactionId: string, amount: number, currency: string): Promise<void> {
    await this.sendLocalNotification({
      title: 'Payment Failed ❌',
      body: `Your payment of ${currency} ${amount.toFixed(2)} could not be processed. Please try again.`,
      type: 'payment',
      data: { transactionId, type: 'payment_failed' },
      priority: 'high',
    });
  }

  // Promotional notifications
  async sendPromotion(title: string, body: string, promoCode?: string): Promise<void> {
    await this.sendLocalNotification({
      title,
      body,
      type: 'promotion',
      data: { promoCode, type: 'promotion' },
      priority: 'normal',
    });
  }

  // Utility methods
  async getLocalNotifications(): Promise<LocalNotification[]> {
    try {
      const stored = await AsyncStorage.getItem('local_notifications');
      if (stored) {
        const notifications = JSON.parse(stored);
        return notifications.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          scheduledFor: n.scheduledFor ? new Date(n.scheduledFor) : undefined,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting local notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getLocalNotifications();
      const updatedNotifications = notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      await AsyncStorage.setItem('local_notifications', JSON.stringify(updatedNotifications));
      await this.updateBadgeCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllNotificationsAsRead(): Promise<void> {
    try {
      const notifications = await this.getLocalNotifications();
      const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
      await AsyncStorage.setItem('local_notifications', JSON.stringify(updatedNotifications));
      await this.updateBadgeCount();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  async getUnreadCount(): Promise<number> {
    const notifications = await this.getLocalNotifications();
    return notifications.filter(n => !n.isRead).length;
  }

  private async saveLocalNotification(notification: LocalNotification): Promise<void> {
    try {
      const existing = await this.getLocalNotifications();
      const updated = [notification, ...existing].slice(0, 100); // Keep only last 100
      await AsyncStorage.setItem('local_notifications', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving local notification:', error);
    }
  }

  private async updateBadgeCount(): Promise<void> {
    try {
      const unreadCount = await this.getUnreadCount();
      await Notifications.setBadgeCountAsync(unreadCount);
    } catch (error) {
      console.error('Error updating badge count:', error);
    }
  }

  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      // Send token to backend (commented out for now)
      // await apiService.makeRequest('/notifications/register-token', 'POST', { token });
    } catch (error) {
      console.error('Error sending token to backend:', error);
    }
  }

  async updateNotificationPreferences(preferences: {
    bookings: boolean;
    orders: boolean;
    payments: boolean;
    promotions: boolean;
    general: boolean;
  }): Promise<void> {
    try {
      await AsyncStorage.setItem('notification_preferences', JSON.stringify(preferences));
      // Send to backend as well (commented out for now)
      // await apiService.makeRequest('/notifications/preferences', 'PUT', preferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }

  async getNotificationPreferences(): Promise<any> {
    try {
      const stored = await AsyncStorage.getItem('notification_preferences');
      return stored ? JSON.parse(stored) : {
        bookings: true,
        orders: true,
        payments: true,
        promotions: true,
        general: true,
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return {
        bookings: true,
        orders: true,
        payments: true,
        promotions: true,
        general: true,
      };
    }
  }

  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }
}

export const notificationService = new NotificationService();