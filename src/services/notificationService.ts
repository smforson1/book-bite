import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiService } from './apiService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private expoPushToken: string | null = null;

  // Initialize push notifications
  async initialize(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return false;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permissions not granted');
        return false;
      }

      // Get push token
      const token = await this.getExpoPushToken();
      if (token) {
        // Register token with backend
        await this.registerPushToken(token);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  // Get Expo push token
  private async getExpoPushToken(): Promise<string | null> {
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      this.expoPushToken = token;
      console.log('Expo push token:', token);
      return token;
    } catch (error) {
      console.error('Error getting Expo push token:', error);
      return null;
    }
  }

  // Register push token with backend
  private async registerPushToken(token: string): Promise<void> {
    try {
      const response = await apiService.registerPushToken(token);
      if (response.success) {
        console.log('Push token registered successfully');
      } else {
        console.error('Failed to register push token:', response.message);
      }
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  }

  // Unregister push token
  async unregisterPushToken(): Promise<void> {
    try {
      const response = await apiService.unregisterPushToken();
      if (response.success) {
        console.log('Push token unregistered successfully');
        this.expoPushToken = null;
      }
    } catch (error) {
      console.error('Error unregistering push token:', error);
    }
  }

  // Send test notification
  async sendTestNotification(): Promise<void> {
    try {
      const response = await apiService.sendTestNotification({
        title: 'Test Notification',
        body: 'This is a test notification from BookBite!',
        data: { type: 'test' }
      });

      if (response.success) {
        console.log('Test notification sent successfully');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }

  // Schedule local notification
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger: trigger || null, // null means immediate
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      throw error;
    }
  }

  // Cancel scheduled notification
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  // Get notification settings
  async getNotificationSettings() {
    try {
      const response = await apiService.getNotificationSettings();
      return response.data?.settings || null;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return null;
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings: {
    orderUpdates?: boolean;
    bookingUpdates?: boolean;
    paymentUpdates?: boolean;
    promotions?: boolean;
    emailNotifications?: boolean;
  }) {
    try {
      const response = await apiService.updateNotificationSettings(settings);
      return response.success;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  }

  // Set up notification listeners
  setupNotificationListeners() {
    // Handle notification received while app is in foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received in foreground:', notification);
        // You can show custom in-app notification here
      }
    );

    // Handle notification tapped
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response);
        const data = response.notification.request.content.data;
        
        // Handle navigation based on notification data
        this.handleNotificationTap(data);
      }
    );

    return {
      foregroundSubscription,
      responseSubscription,
    };
  }

  // Handle notification tap navigation
  private handleNotificationTap(data: any) {
    // This should be implemented based on your navigation structure
    console.log('Handle notification tap with data:', data);
    
    // Example navigation logic:
    // if (data.type === 'order_update') {
    //   navigation.navigate('OrderHistory');
    // } else if (data.type === 'booking_update') {
    //   navigation.navigate('Bookings');
    // } else if (data.type === 'payment_update') {
    //   navigation.navigate('PaymentHistory');
    // }
  }

  // Get current push token
  getCurrentPushToken(): string | null {
    return this.expoPushToken;
  }

  // Check if notifications are enabled
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  // Open device notification settings
  async openNotificationSettings(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await Notifications.openSettingsAsync();
      } else {
        // For Android, you might need to use a different approach
        console.log('Opening notification settings not supported on this platform');
      }
    } catch (error) {
      console.error('Error opening notification settings:', error);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();