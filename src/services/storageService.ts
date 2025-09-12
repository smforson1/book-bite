import AsyncStorage from '@react-native-async-storage/async-storage';
import { Hotel, Room, Restaurant, MenuItem, Booking, Order, User, Review } from '../types';

interface StorageKeys {
  AUTH_TOKEN: 'auth_token';
  USER_DATA: 'user_data';
  HOTELS: 'hotels';
  ROOMS: 'rooms';
  RESTAURANTS: 'restaurants';
  MENU_ITEMS: 'menu_items';
  BOOKINGS: 'bookings';
  ORDERS: 'orders';
  CART: 'cart';
  REVIEWS: 'reviews';
  APP_SETTINGS: 'app_settings';
  LAST_SYNC: 'last_sync';
}

const STORAGE_KEYS: StorageKeys = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  HOTELS: 'hotels',
  ROOMS: 'rooms',
  RESTAURANTS: 'restaurants',
  MENU_ITEMS: 'menu_items',
  BOOKINGS: 'bookings',
  ORDERS: 'orders',
  CART: 'cart',
  REVIEWS: 'reviews',
  APP_SETTINGS: 'app_settings',
  LAST_SYNC: 'last_sync',
};

interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  language: string;
  currency: string;
  location: {
    autoDetect: boolean;
    savedLocation?: string;
  };
  preferences: {
    autoSaveCart: boolean;
    rememberFilters: boolean;
    offlineMode: boolean;
  };
}

interface StorageItem<T> {
  data: T;
  timestamp: number;
  version: string;
  checksum?: string;
}

class StorageService {
  private readonly version = '1.0.0';
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  // Generic storage methods
  async setItem<T>(key: keyof StorageKeys, data: T, options?: { compress?: boolean; encrypt?: boolean }): Promise<boolean> {
    try {
      const storageItem: StorageItem<T> = {
        data,
        timestamp: Date.now(),
        version: this.version,
      };

      // Add checksum for data integrity
      if (options?.encrypt) {
        storageItem.checksum = this.generateChecksum(JSON.stringify(data));
      }

      const serializedData = JSON.stringify(storageItem);
      await AsyncStorage.setItem(STORAGE_KEYS[key], serializedData);
      return true;
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      return false;
    }
  }

  async getItem<T>(key: keyof StorageKeys, defaultValue: T | null = null): Promise<T | null> {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEYS[key]);
      if (!storedData) return defaultValue;

      const storageItem: StorageItem<T> = JSON.parse(storedData);
      
      // Version compatibility check
      if (storageItem.version !== this.version) {
        console.warn(`Version mismatch for ${key}. Expected: ${this.version}, Found: ${storageItem.version}`);
        // Handle migration if needed
        return await this.migrateData(key, storageItem.data, storageItem.version);
      }

      // Data integrity check
      if (storageItem.checksum) {
        const calculatedChecksum = this.generateChecksum(JSON.stringify(storageItem.data));
        if (calculatedChecksum !== storageItem.checksum) {
          console.error(`Data integrity check failed for ${key}`);
          return defaultValue;
        }
      }

      return storageItem.data;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return defaultValue;
    }
  }

  async removeItem(key: keyof StorageKeys): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS[key]);
      return true;
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      return false;
    }
  }

  async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // Specific data type methods
  async saveUser(user: User): Promise<boolean> {
    return this.setItem('USER_DATA', user, { encrypt: true });
  }

  async getUser(): Promise<User | null> {
    return this.getItem<User>('USER_DATA');
  }

  async saveAuthToken(token: string): Promise<boolean> {
    return this.setItem('AUTH_TOKEN', token, { encrypt: true });
  }

  async getAuthToken(): Promise<string | null> {
    return this.getItem<string>('AUTH_TOKEN');
  }

  async saveHotels(hotels: Hotel[]): Promise<boolean> {
    return this.setItem('HOTELS', hotels);
  }

  async getHotels(): Promise<Hotel[]> {
    return (await this.getItem<Hotel[]>('HOTELS', [])) || [];
  }

  async saveRooms(rooms: Room[]): Promise<boolean> {
    return this.setItem('ROOMS', rooms);
  }

  async getRooms(): Promise<Room[]> {
    return (await this.getItem<Room[]>('ROOMS', [])) || [];
  }

  async saveRestaurants(restaurants: Restaurant[]): Promise<boolean> {
    return this.setItem('RESTAURANTS', restaurants);
  }

  async getRestaurants(): Promise<Restaurant[]> {
    return (await this.getItem<Restaurant[]>('RESTAURANTS', [])) || [];
  }

  async saveMenuItems(menuItems: MenuItem[]): Promise<boolean> {
    return this.setItem('MENU_ITEMS', menuItems);
  }

  async getMenuItems(): Promise<MenuItem[]> {
    return (await this.getItem<MenuItem[]>('MENU_ITEMS', [])) || [];
  }

  async saveBookings(bookings: Booking[]): Promise<boolean> {
    return this.setItem('BOOKINGS', bookings);
  }

  async getBookings(): Promise<Booking[]> {
    const bookings = (await this.getItem<any[]>('BOOKINGS', [])) || [];
    // Convert date strings back to Date objects
    return bookings.map(booking => ({
      ...booking,
      checkIn: new Date(booking.checkIn),
      checkOut: new Date(booking.checkOut),
      createdAt: new Date(booking.createdAt),
      paymentDate: booking.paymentDate ? new Date(booking.paymentDate) : undefined,
    }));
  }

  async saveOrders(orders: Order[]): Promise<boolean> {
    return this.setItem('ORDERS', orders);
  }

  async getOrders(): Promise<Order[]> {
    const orders = (await this.getItem<any[]>('ORDERS', [])) || [];
    // Convert date strings back to Date objects
    return orders.map(order => ({
      ...order,
      estimatedDeliveryTime: new Date(order.estimatedDeliveryTime),
      createdAt: new Date(order.createdAt),
      paymentDate: order.paymentDate ? new Date(order.paymentDate) : undefined,
    }));
  }

  async saveCart(cart: any[]): Promise<boolean> {
    return this.setItem('CART', cart);
  }

  async getCart(): Promise<any[]> {
    return (await this.getItem<any[]>('CART', [])) || [];
  }

  async saveReviews(reviews: Review[]): Promise<boolean> {
    return this.setItem('REVIEWS', reviews);
  }

  async getReviews(): Promise<Review[]> {
    const reviews = (await this.getItem<any[]>('REVIEWS', [])) || [];
    // Convert date strings back to Date objects
    return reviews.map(review => ({
      ...review,
      createdAt: new Date(review.createdAt),
      updatedAt: review.updatedAt ? new Date(review.updatedAt) : undefined,
    }));
  }

  async saveAppSettings(settings: AppSettings): Promise<boolean> {
    return this.setItem('APP_SETTINGS', settings);
  }

  async getAppSettings(): Promise<AppSettings> {
    const settings = await this.getItem<AppSettings>('APP_SETTINGS', {
      theme: 'auto',
      notifications: {
        push: true,
        email: true,
        sms: false,
      },
      language: 'en',
      currency: 'USD',
      location: {
        autoDetect: true,
      },
      preferences: {
        autoSaveCart: true,
        rememberFilters: true,
        offlineMode: false,
      },
    });
    return settings || {
      theme: 'auto',
      notifications: {
        push: true,
        email: true,
        sms: false,
      },
      language: 'en',
      currency: 'USD',
      location: {
        autoDetect: true,
      },
      preferences: {
        autoSaveCart: true,
        rememberFilters: true,
        offlineMode: false,
      },
    };
  }

  // Utility methods
  async getStorageInfo(): Promise<{
    totalSize: number;
    itemCount: number;
    keys: string[];
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }

      return {
        totalSize,
        itemCount: keys.length,
        keys: [...keys],
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        totalSize: 0,
        itemCount: 0,
        keys: [],
      };
    }
  }

  async exportData(): Promise<string | null> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const data: Record<string, any> = {};
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          data[key] = JSON.parse(value);
        }
      }

      return JSON.stringify({
        exportedAt: new Date().toISOString(),
        version: this.version,
        data,
      }, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.data) {
        throw new Error('Invalid import data format');
      }

      // Clear existing data
      await this.clear();

      // Import new data
      for (const [key, value] of Object.entries(importData.data)) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Backup and sync methods
  async createBackup(): Promise<string | null> {
    try {
      const exportData = await this.exportData();
      if (exportData) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return `bookbite-backup-${timestamp}.json`;
      }
      return null;
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  }

  async setLastSync(timestamp: Date): Promise<boolean> {
    return this.setItem('LAST_SYNC', timestamp.toISOString());
  }

  async getLastSync(): Promise<Date | null> {
    const timestamp = await this.getItem<string>('LAST_SYNC');
    return timestamp ? new Date(timestamp) : null;
  }

  // Private utility methods
  private generateChecksum(data: string): string {
    // Simple hash function for data integrity (in production, use a proper hash function)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private async migrateData<T>(key: keyof StorageKeys, data: T, fromVersion: string): Promise<T | null> {
    console.log(`Migrating ${key} from version ${fromVersion} to ${this.version}`);
    
    // Implement migration logic based on version differences
    // For now, just return the data as-is
    try {
      await this.setItem(key, data);
      return data;
    } catch (error) {
      console.error(`Error migrating ${key}:`, error);
      return null;
    }
  }

  // Retry mechanism for critical operations
  private async retryOperation<T>(operation: () => Promise<T>, retries = this.maxRetries): Promise<T | null> {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error) {
        console.warn(`Operation failed, retry ${i + 1}/${retries}:`, error);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
        }
      }
    }
    return null;
  }
}

export const storageService = new StorageService();
export type { AppSettings };
export { STORAGE_KEYS };