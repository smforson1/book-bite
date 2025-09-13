import { Order, Booking } from '../types';

export interface OrderTrackingUpdate {
  orderId: string;
  status: 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';
  message: string;
  timestamp: Date;
  estimatedDeliveryTime?: Date;
  driverLocation?: {
    latitude: number;
    longitude: number;
  };
  driverPhone?: string;
}

export interface BookingUpdate {
  bookingId: string;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  message: string;
  timestamp: Date;
}

export interface RealTimeMessage {
  type: 'order_update' | 'booking_update' | 'notification' | 'driver_location';
  data: OrderTrackingUpdate | BookingUpdate | any;
  userId: string;
}

class RealTimeService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private listeners: Map<string, Function[]> = new Map();
  private isConnected = false;
  private userId: string | null = null;
  private baseUrl: string;

  constructor() {
    // Ghana-specific WebSocket server - would be deployed in Ghana for better latency
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'wss://api.bookbite.com.gh/ws'  // Ghana domain
      : 'ws://localhost:3001/ws';
  }

  // Initialize connection with user authentication
  connect(userId: string, authToken: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.userId = userId;
        const wsUrl = `${this.baseUrl}?userId=${userId}&token=${authToken}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected for real-time updates');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          
          // Send ping to maintain connection
          this.startHeartbeat();
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const message: RealTimeMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket connection closed:', event.code, event.reason);
          this.isConnected = false;
          this.handleDisconnection();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnected = false;
          reject(error);
        };

        // Timeout for connection
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

      } catch (error) {
        reject(error);
      }
    });
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
      this.userId = null;
    }
  }

  // Subscribe to specific event types
  subscribe(eventType: string, callback: Function) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Track specific order
  trackOrder(orderId: string) {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({
        type: 'track_order',
        orderId: orderId,
        userId: this.userId
      }));
    }
  }

  // Track specific booking
  trackBooking(bookingId: string) {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({
        type: 'track_booking',
        bookingId: bookingId,
        userId: this.userId
      }));
    }
  }

  // Send message to restaurant/hotel owner
  sendMessage(recipientId: string, message: string, type: 'order' | 'booking') {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({
        type: 'send_message',
        recipientId: recipientId,
        message: message,
        messageType: type,
        userId: this.userId
      }));
    }
  }

  // Handle incoming messages
  private handleMessage(message: RealTimeMessage) {
    const { type, data } = message;
    
    // Emit to specific listeners
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }

    // Emit to general listeners
    const generalCallbacks = this.listeners.get('message');
    if (generalCallbacks) {
      generalCallbacks.forEach(callback => callback(message));
    }

    // Handle specific message types
    switch (type) {
      case 'order_update':
        this.handleOrderUpdate(data as OrderTrackingUpdate);
        break;
      case 'booking_update':
        this.handleBookingUpdate(data as BookingUpdate);
        break;
      case 'driver_location':
        this.handleDriverLocationUpdate(data);
        break;
      case 'notification':
        this.handleNotification(data);
        break;
    }
  }

  // Handle order status updates
  private handleOrderUpdate(update: OrderTrackingUpdate) {
    console.log('Order update received:', update);
    
    // Store update locally for offline access
    this.storeOrderUpdate(update);
    
    // Show local notification if app is in background
    if (document.hidden) {
      this.showLocalNotification(
        'Order Update',
        update.message,
        'order'
      );
    }
  }

  // Handle booking updates
  private handleBookingUpdate(update: BookingUpdate) {
    console.log('Booking update received:', update);
    
    // Store update locally
    this.storeBookingUpdate(update);
    
    // Show notification
    if (document.hidden) {
      this.showLocalNotification(
        'Booking Update',
        update.message,
        'booking'
      );
    }
  }

  // Handle driver location updates
  private handleDriverLocationUpdate(data: any) {
    const callbacks = this.listeners.get('driver_location');
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Handle general notifications
  private handleNotification(data: any) {
    console.log('Notification received:', data);
    
    // Show notification
    this.showLocalNotification(
      data.title || 'BookBite Notification',
      data.message,
      data.type || 'general'
    );
  }

  // Reconnection logic
  private handleDisconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.userId) {
          // Get stored auth token for reconnection
          this.getStoredAuthToken().then(token => {
            if (token) {
              this.connect(this.userId!, token).catch(error => {
                console.error('Reconnection failed:', error);
              });
            }
          });
        }
      }, this.reconnectDelay);
      
      // Exponential backoff
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
    } else {
      console.log('Max reconnection attempts reached');
      // Notify listeners about permanent disconnection
      const callbacks = this.listeners.get('disconnected');
      if (callbacks) {
        callbacks.forEach(callback => callback());
      }
    }
  }

  // Heartbeat to maintain connection
  private startHeartbeat() {
    setInterval(() => {
      if (this.isConnected && this.ws) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping every 30 seconds
  }

  // Store order update locally
  private async storeOrderUpdate(update: OrderTrackingUpdate) {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const key = `order_updates_${update.orderId}`;
      const existing = await AsyncStorage.default.getItem(key);
      const updates = existing ? JSON.parse(existing) : [];
      updates.push(update);
      await AsyncStorage.default.setItem(key, JSON.stringify(updates));
    } catch (error) {
      console.error('Error storing order update:', error);
    }
  }

  // Store booking update locally
  private async storeBookingUpdate(update: BookingUpdate) {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const key = `booking_updates_${update.bookingId}`;
      const existing = await AsyncStorage.default.getItem(key);
      const updates = existing ? JSON.parse(existing) : [];
      updates.push(update);
      await AsyncStorage.default.setItem(key, JSON.stringify(updates));
    } catch (error) {
      console.error('Error storing booking update:', error);
    }
  }

  // Get stored auth token
  private async getStoredAuthToken(): Promise<string | null> {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      return await AsyncStorage.default.getItem('AUTH_TOKEN');
    } catch (error) {
      console.error('Error getting stored auth token:', error);
      return null;
    }
  }

  // Show local notification
  private showLocalNotification(title: string, message: string, type: string) {
    // This would integrate with Expo Notifications
    // For now, we'll just log it
    console.log(`Notification [${type}]: ${title} - ${message}`);
    
    // In a real implementation, this would use:
    // import * as Notifications from 'expo-notifications';
    // Notifications.scheduleNotificationAsync({...});
  }

  // Get order tracking history
  async getOrderTrackingHistory(orderId: string): Promise<OrderTrackingUpdate[]> {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const key = `order_updates_${orderId}`;
      const stored = await AsyncStorage.default.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting order tracking history:', error);
      return [];
    }
  }

  // Get booking update history
  async getBookingUpdateHistory(bookingId: string): Promise<BookingUpdate[]> {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const key = `booking_updates_${bookingId}`;
      const stored = await AsyncStorage.default.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting booking update history:', error);
      return [];
    }
  }

  // Check connection status
  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  // Get connection info
  getConnectionInfo() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      userId: this.userId,
      wsUrl: this.baseUrl
    };
  }

  // Ghana-specific delivery tracking for major cities
  getGhanaDeliveryZones() {
    return {
      'accra': {
        name: 'Greater Accra',
        zones: ['East Legon', 'Cantonments', 'Airport', 'Tema', 'Madina', 'Adenta', 'Kasoa'],
        averageDeliveryTime: '30-45 mins'
      },
      'kumasi': {
        name: 'Kumasi',
        zones: ['Adum', 'Asokwa', 'Bantama', 'Suame', 'Airport Roundabout'],
        averageDeliveryTime: '25-40 mins'
      },
      'takoradi': {
        name: 'Takoradi',
        zones: ['Market Circle', 'New Takoradi', 'Effia-Kuma', 'Sekondi'],
        averageDeliveryTime: '20-35 mins'
      },
      'cape_coast': {
        name: 'Cape Coast',
        zones: ['Cape Coast Castle', 'Pedu', 'Abura', 'UCC Campus'],
        averageDeliveryTime: '20-30 mins'
      }
    };
  }
}

// Export singleton instance
export const realTimeService = new RealTimeService();
export default realTimeService;