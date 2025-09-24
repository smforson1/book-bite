import AsyncStorage from '@react-native-async-storage/async-storage';
import { Hotel, Room, Restaurant, MenuItem, Booking, Order, Review, User } from '../types';
import NetInfo from '@react-native-community/netinfo';
import { storageService, AppSettings } from './storageService';
import { errorHandlingService } from './errorHandlingService';
import { EventEmitter } from 'events';

// Extend the existing types with synced property
interface ExtendedBooking extends Booking {
  synced?: boolean;
}

interface ExtendedOrder extends Order {
  synced?: boolean;
}

interface ExtendedReview extends Review {
  synced?: boolean;
}

export interface OfflineDataSnapshot {
  timestamp: Date;
  data: {
    hotels: Hotel[];
    rooms: Room[];
    restaurants: Restaurant[];
    menuItems: MenuItem[];
    bookings: ExtendedBooking[];
    orders: ExtendedOrder[];
    cart: any[];
    reviews: ExtendedReview[];
    user: User | null;
  };
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSync: Date | null;
  pendingItems: number;
  totalItems: number;
  progress: number;
  errors: string[];
}

class OfflineManager extends EventEmitter {
  private isOnline: boolean = false;
  private syncStatus: SyncStatus = {
    isSyncing: false,
    lastSync: null,
    pendingItems: 0,
    totalItems: 0,
    progress: 0,
    errors: []
  };
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL = 30000; // 30 seconds
  private readonly MAX_OFFLINE_DAYS = 30; // Keep data for 30 days

  constructor() {
    super();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Set up network monitoring
      this.setupNetworkMonitoring();
      
      // Load sync status
      await this.loadSyncStatus();
      
      // Start periodic sync
      this.startPeriodicSync();
      
      console.log('Offline Manager initialized');
    } catch (error) {
      console.error('Failed to initialize Offline Manager:', error);
    }
  }

  private setupNetworkMonitoring(): void {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      // Emit network status change
      this.emit('networkStatusChange', this.isOnline);

      // If we just came online, trigger sync
      if (!wasOnline && this.isOnline) {
        this.triggerSync();
      }
    });
  }

  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.triggerSync();
      }
    }, this.SYNC_INTERVAL);
  }

  async triggerSync(): Promise<void> {
    if (this.syncStatus.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    this.updateSyncStatus({ isSyncing: true });
    this.emit('syncStart');

    try {
      // Perform sync operations
      await this.syncUserData();
      await this.syncBookings();
      await this.syncOrders();
      await this.syncCart();
      await this.syncReviews();
      
      // Update last sync timestamp
      const now = new Date();
      await storageService.setLastSync(now);
      this.updateSyncStatus({ 
        lastSync: now,
        isSyncing: false 
      });
      
      this.emit('syncComplete');
    } catch (error: any) {
      console.error('Sync failed:', error);
      this.updateSyncStatus({ 
        isSyncing: false,
        errors: [...this.syncStatus.errors, error.message || 'Unknown error']
      });
      this.emit('syncError', error);
    }
  }

  private async syncUserData(): Promise<void> {
    try {
      const user = await storageService.getUser();
      if (user && this.isOnline) {
        // In a real implementation, this would sync with the backend
        console.log('User data synced');
      }
    } catch (error: any) {
      throw new Error(`Failed to sync user data: ${error.message || 'Unknown error'}`);
    }
  }

  private async syncBookings(): Promise<void> {
    try {
      const bookings = await storageService.getBookings();
      const extendedBookings: ExtendedBooking[] = bookings.map(booking => ({
        ...booking,
        synced: (booking as ExtendedBooking).synced || false
      }));
      
      const pendingBookings = extendedBookings.filter(booking => !booking.synced);
      
      if (pendingBookings.length > 0 && this.isOnline) {
        this.updateSyncStatus({ 
          pendingItems: this.syncStatus.pendingItems + pendingBookings.length,
          totalItems: this.syncStatus.totalItems + pendingBookings.length
        });

        // In a real implementation, this would send bookings to the backend
        for (let i = 0; i < pendingBookings.length; i++) {
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Mark as synced
            const bookingIndex = extendedBookings.findIndex(b => b.id === pendingBookings[i].id);
            if (bookingIndex !== -1) {
              extendedBookings[bookingIndex].synced = true;
            }
            
            this.updateSyncStatus({ 
              progress: ((i + 1) / pendingBookings.length) * 100
            });
          } catch (error) {
            console.error('Failed to sync booking:', error);
          }
        }
        
        // Save updated bookings
        await storageService.saveBookings(extendedBookings);
      }
    } catch (error: any) {
      throw new Error(`Failed to sync bookings: ${error.message || 'Unknown error'}`);
    }
  }

  private async syncOrders(): Promise<void> {
    try {
      const orders = await storageService.getOrders();
      const extendedOrders: ExtendedOrder[] = orders.map(order => ({
        ...order,
        synced: (order as ExtendedOrder).synced || false
      }));
      
      const pendingOrders = extendedOrders.filter(order => !order.synced);
      
      if (pendingOrders.length > 0 && this.isOnline) {
        this.updateSyncStatus({ 
          pendingItems: this.syncStatus.pendingItems + pendingOrders.length,
          totalItems: this.syncStatus.totalItems + pendingOrders.length
        });

        // In a real implementation, this would send orders to the backend
        for (let i = 0; i < pendingOrders.length; i++) {
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Mark as synced
            const orderIndex = extendedOrders.findIndex(o => o.id === pendingOrders[i].id);
            if (orderIndex !== -1) {
              extendedOrders[orderIndex].synced = true;
            }
            
            this.updateSyncStatus({ 
              progress: ((i + 1) / pendingOrders.length) * 100
            });
          } catch (error) {
            console.error('Failed to sync order:', error);
          }
        }
        
        // Save updated orders
        await storageService.saveOrders(extendedOrders);
      }
    } catch (error: any) {
      throw new Error(`Failed to sync orders: ${error.message || 'Unknown error'}`);
    }
  }

  private async syncCart(): Promise<void> {
    try {
      const cart = await storageService.getCart();
      if (cart.length > 0 && this.isOnline) {
        // In a real implementation, this would sync cart with backend
        console.log('Cart synced');
      }
    } catch (error: any) {
      throw new Error(`Failed to sync cart: ${error.message || 'Unknown error'}`);
    }
  }

  private async syncReviews(): Promise<void> {
    try {
      const reviews = await storageService.getReviews();
      const extendedReviews: ExtendedReview[] = reviews.map(review => ({
        ...review,
        synced: (review as ExtendedReview).synced || false
      }));
      
      const pendingReviews = extendedReviews.filter(review => !review.synced);
      
      if (pendingReviews.length > 0 && this.isOnline) {
        this.updateSyncStatus({ 
          pendingItems: this.syncStatus.pendingItems + pendingReviews.length,
          totalItems: this.syncStatus.totalItems + pendingReviews.length
        });

        // In a real implementation, this would send reviews to the backend
        for (let i = 0; i < pendingReviews.length; i++) {
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Mark as synced
            const reviewIndex = extendedReviews.findIndex(r => r.id === pendingReviews[i].id);
            if (reviewIndex !== -1) {
              extendedReviews[reviewIndex].synced = true;
            }
            
            this.updateSyncStatus({ 
              progress: ((i + 1) / pendingReviews.length) * 100
            });
          } catch (error) {
            console.error('Failed to sync review:', error);
          }
        }
        
        // Save updated reviews
        await storageService.saveReviews(extendedReviews);
      }
    } catch (error: any) {
      throw new Error(`Failed to sync reviews: ${error.message || 'Unknown error'}`);
    }
  }

  async createDataSnapshot(): Promise<OfflineDataSnapshot> {
    try {
      // Get all data with extended types
      const hotels = await storageService.getHotels();
      const rooms = await storageService.getRooms();
      const restaurants = await storageService.getRestaurants();
      const menuItems = await storageService.getMenuItems();
      const bookings = await storageService.getBookings();
      const orders = await storageService.getOrders();
      const cart = await storageService.getCart();
      const reviews = await storageService.getReviews();
      const user = await storageService.getUser();
      
      const snapshot: OfflineDataSnapshot = {
        timestamp: new Date(),
        data: {
          hotels,
          rooms,
          restaurants,
          menuItems,
          bookings: bookings.map(booking => ({
            ...booking,
            synced: (booking as ExtendedBooking).synced || false
          })),
          orders: orders.map(order => ({
            ...order,
            synced: (order as ExtendedOrder).synced || false
          })),
          cart,
          reviews: reviews.map(review => ({
            ...review,
            synced: (review as ExtendedReview).synced || false
          })),
          user
        }
      };

      // Save snapshot
      await AsyncStorage.setItem('offline_snapshot', JSON.stringify(snapshot));
      
      return snapshot;
    } catch (error: any) {
      throw new Error(`Failed to create data snapshot: ${error.message || 'Unknown error'}`);
    }
  }

  async restoreFromSnapshot(): Promise<boolean> {
    try {
      const snapshotStr = await AsyncStorage.getItem('offline_snapshot');
      if (!snapshotStr) {
        return false;
      }

      const snapshot: OfflineDataSnapshot = JSON.parse(snapshotStr);
      
      // Restore data
      await Promise.all([
        storageService.saveHotels(snapshot.data.hotels),
        storageService.saveRooms(snapshot.data.rooms),
        storageService.saveRestaurants(snapshot.data.restaurants),
        storageService.saveMenuItems(snapshot.data.menuItems),
        storageService.saveBookings(snapshot.data.bookings),
        storageService.saveOrders(snapshot.data.orders),
        storageService.saveCart(snapshot.data.cart),
        storageService.saveReviews(snapshot.data.reviews),
        snapshot.data.user && storageService.saveUser(snapshot.data.user)
      ]);

      return true;
    } catch (error) {
      console.error('Failed to restore from snapshot:', error);
      return false;
    }
  }

  async clearOldOfflineData(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.MAX_OFFLINE_DAYS);

      // Get all data and filter out old items
      const [bookings, orders, reviews] = await Promise.all([
        storageService.getBookings(),
        storageService.getOrders(),
        storageService.getReviews()
      ]);

      // Filter out old items
      const recentBookings = bookings.filter(booking => 
        booking.createdAt > cutoffDate
      );

      const recentOrders = orders.filter(order => 
        order.createdAt > cutoffDate
      );

      const recentReviews = reviews.filter(review => 
        review.createdAt > cutoffDate
      );

      // Save filtered data
      await Promise.all([
        storageService.saveBookings(recentBookings),
        storageService.saveOrders(recentOrders),
        storageService.saveReviews(recentReviews)
      ]);

      console.log('Old offline data cleared');
    } catch (error) {
      console.error('Failed to clear old offline data:', error);
    }
  }

  async enableOfflineMode(): Promise<void> {
    try {
      const settings = await storageService.getAppSettings();
      settings.preferences.offlineMode = true;
      await storageService.saveAppSettings(settings);
      
      // Create a snapshot for offline use
      await this.createDataSnapshot();
      
      this.emit('offlineModeEnabled');
    } catch (error) {
      console.error('Failed to enable offline mode:', error);
    }
  }

  async disableOfflineMode(): Promise<void> {
    try {
      const settings = await storageService.getAppSettings();
      settings.preferences.offlineMode = false;
      await storageService.saveAppSettings(settings);
      
      this.emit('offlineModeDisabled');
    } catch (error) {
      console.error('Failed to disable offline mode:', error);
    }
  }

  isOfflineModeEnabled(): boolean {
    // This would check the app settings in a real implementation
    return false;
  }

  getNetworkStatus(): boolean {
    return this.isOnline;
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  private updateSyncStatus(updates: Partial<SyncStatus>): void {
    this.syncStatus = { ...this.syncStatus, ...updates };
    this.emit('syncStatusUpdate', this.syncStatus);
  }

  private async loadSyncStatus(): Promise<void> {
    try {
      const lastSync = await storageService.getLastSync();
      if (lastSync) {
        this.syncStatus.lastSync = lastSync;
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  }

  async cleanup(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    // Clear any pending timeouts
    this.emit('cleanup');
  }
}

export const offlineManager = new OfflineManager();
export default offlineManager;