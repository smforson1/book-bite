import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ghanaSMSService } from './ghanaSMSService';
import { ghanaAnalyticsService } from './ghanaAnalyticsService';

export interface ErrorReport {
  id: string;
  timestamp: Date;
  type: 'network' | 'payment' | 'api' | 'ui' | 'location' | 'sms' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  userId?: string;
  context: {
    screen?: string;
    action?: string;
    network?: boolean;
    device?: string;
    location?: string;
  };
  resolved: boolean;
  userImpact: 'none' | 'minor' | 'moderate' | 'severe';
}

export interface OfflineQueueItem {
  id: string;
  type: 'order' | 'booking' | 'payment' | 'analytics' | 'sms';
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'normal' | 'high';
}

export interface ConnectionStatus {
  isConnected: boolean;
  type: string | null;
  isInternetReachable: boolean | null;
  connectionQuality: 'poor' | 'fair' | 'good' | 'excellent';
}

class ErrorHandlingService {
  private errors: ErrorReport[] = [];
  private offlineQueue: OfflineQueueItem[] = [];
  private connectionStatus: ConnectionStatus = {
    isConnected: false,
    type: null,
    isInternetReachable: null,
    connectionQuality: 'poor'
  };
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private maxErrorStorage = 500; // Maximum errors to store locally
  private maxQueueSize = 100; // Maximum offline queue items

  constructor() {
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      // Set up network monitoring
      this.setupNetworkMonitoring();
      
      // Load stored errors and queue
      await this.loadStoredData();
      
      // Set up global error handlers
      this.setupGlobalErrorHandlers();
      
      console.log('Error Handling Service initialized');
    } catch (error) {
      console.error('Failed to initialize Error Handling Service:', error);
    }
  }

  // Network monitoring setup
  private setupNetworkMonitoring(): void {
    NetInfo.addEventListener(state => {
      const wasConnected = this.connectionStatus.isConnected;
      
      this.connectionStatus = {
        isConnected: state.isConnected ?? false,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
        connectionQuality: this.assessConnectionQuality(state)
      };

      // If connection restored, process offline queue
      if (!wasConnected && this.connectionStatus.isConnected) {
        this.processOfflineQueue();
      }

      // Log network changes
      if (wasConnected !== this.connectionStatus.isConnected) {
        this.logError({
          type: 'network',
          severity: this.connectionStatus.isConnected ? 'low' : 'medium',
          message: `Network ${this.connectionStatus.isConnected ? 'connected' : 'disconnected'}`,
          context: {
            network: this.connectionStatus.isConnected,
            action: 'network_change'
          },
          userImpact: this.connectionStatus.isConnected ? 'none' : 'moderate'
        });
      }
    });
  }

  // Assess connection quality based on network state
  private assessConnectionQuality(state: any): 'poor' | 'fair' | 'good' | 'excellent' {
    if (!state.isConnected) return 'poor';
    
    if (state.type === 'wifi') {
      // WiFi generally better quality
      return state.isInternetReachable ? 'excellent' : 'good';
    } else if (state.type === 'cellular') {
      // Assess based on cellular generation if available
      const details = state.details;
      if (details?.cellularGeneration === '4g' || details?.cellularGeneration === '5g') {
        return 'good';
      } else if (details?.cellularGeneration === '3g') {
        return 'fair';
      } else {
        return 'poor';
      }
    }
    
    return 'fair';
  }

  // Global error handlers
  private setupGlobalErrorHandlers(): void {
    // React Native error boundary alternative
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('Warning:') || message.includes('[DEBUG]')) {
        // Skip React warnings and debug messages
        originalConsoleError.apply(console, args);
        return;
      }

      this.logError({
        type: 'unknown',
        severity: 'medium',
        message: message,
        context: {
          action: 'console_error'
        },
        userImpact: 'minor'
      });

      originalConsoleError.apply(console, args);
    };
  }

  // Log error with Ghana context
  async logError(errorData: Omit<ErrorReport, 'id' | 'timestamp' | 'resolved'>): Promise<string> {
    try {
      const error: ErrorReport = {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        resolved: false,
        ...errorData
      };

      this.errors.push(error);

      // Track in analytics if connected
      if (this.connectionStatus.isConnected) {
        try {
          await ghanaAnalyticsService.trackEvent({
            type: 'user_action',
            userId: errorData.userId,
            data: {
              errorType: error.type,
              severity: error.severity,
              message: error.message.substring(0, 100), // Truncate for analytics
              screen: error.context.screen,
              action: error.context.action,
              userImpact: error.userImpact
            }
          });
        } catch (analyticsError) {
          console.warn('Failed to track error in analytics:', analyticsError);
        }
      }

      // Critical errors need immediate attention
      if (error.severity === 'critical') {
        await this.handleCriticalError(error);
      }

      // Auto-save errors
      await this.saveErrors();
      
      return error.id;
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
      return 'log_failed';
    }
  }

  // Handle critical errors
  private async handleCriticalError(error: ErrorReport): Promise<void> {
    try {
      // For critical payment errors, try to notify via SMS
      if (error.type === 'payment' && error.userId) {
        // Get user phone number from storage (would be in user context in real app)
        const userData = await AsyncStorage.getItem('USER_DATA');
        if (userData) {
          const user = JSON.parse(userData);
          if (user.phone) {
            try {
              await ghanaSMSService.sendSMS({
                to: user.phone,
                message: 'Critical payment error detected in BookBite. Please contact support if you experience any issues.',
                type: 'promo',
                priority: 'high'
              });
            } catch (smsError) {
              console.error('Failed to send critical error SMS:', smsError);
            }
          }
        }
      }

      // Log critical error for admin review
      console.error('CRITICAL ERROR:', error);
    } catch (error) {
      console.error('Failed to handle critical error:', error);
    }
  }

  // Add item to offline queue
  async addToOfflineQueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    try {
      const queueItem: OfflineQueueItem = {
        id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        retryCount: 0,
        ...item
      };

      this.offlineQueue.push(queueItem);

      // Limit queue size
      if (this.offlineQueue.length > this.maxQueueSize) {
        this.offlineQueue = this.offlineQueue
          .sort((a, b) => {
            // Sort by priority first, then timestamp
            const priorityOrder = { high: 3, normal: 2, low: 1 };
            const aPriority = priorityOrder[a.priority];
            const bPriority = priorityOrder[b.priority];
            
            if (aPriority !== bPriority) {
              return bPriority - aPriority;
            }
            
            return b.timestamp.getTime() - a.timestamp.getTime();
          })
          .slice(0, this.maxQueueSize);
      }

      await this.saveOfflineQueue();
      
      // Try to process immediately if connected
      if (this.connectionStatus.isConnected) {
        this.processQueueItem(queueItem);
      }

      return queueItem.id;
    } catch (error) {
      console.error('Failed to add to offline queue:', error);
      return 'queue_failed';
    }
  }

  // Process offline queue when connection restored
  private async processOfflineQueue(): Promise<void> {
    if (!this.connectionStatus.isConnected || this.offlineQueue.length === 0) {
      return;
    }

    console.log(`Processing ${this.offlineQueue.length} offline queue items`);

    // Process high priority items first
    const priorityOrder = ['high', 'normal', 'low'] as const;
    
    for (const priority of priorityOrder) {
      const items = this.offlineQueue.filter(item => 
        item.priority === priority && item.retryCount < item.maxRetries
      );
      
      for (const item of items) {
        await this.processQueueItem(item);
        // Add delay between requests to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Clean up completed items
    this.offlineQueue = this.offlineQueue.filter(item => 
      item.retryCount < item.maxRetries
    );
    
    await this.saveOfflineQueue();
  }

  // Process individual queue item
  private async processQueueItem(item: OfflineQueueItem): Promise<void> {
    try {
      item.retryCount++;
      
      let success = false;
      
      switch (item.type) {
        case 'order':
          success = await this.processOfflineOrder(item.data);
          break;
        case 'booking':
          success = await this.processOfflineBooking(item.data);
          break;
        case 'payment':
          success = await this.processOfflinePayment(item.data);
          break;
        case 'analytics':
          success = await this.processOfflineAnalytics(item.data);
          break;
        case 'sms':
          success = await this.processOfflineSMS(item.data);
          break;
      }

      if (success) {
        // Remove from queue
        this.offlineQueue = this.offlineQueue.filter(q => q.id !== item.id);
        console.log(`Successfully processed offline ${item.type}:`, item.id);
      } else if (item.retryCount >= item.maxRetries) {
        // Max retries reached, log error
        await this.logError({
          type: 'api',
          severity: 'medium',
          message: `Failed to process offline ${item.type} after ${item.maxRetries} attempts`,
          context: {
            action: 'offline_queue_processing',
            network: this.connectionStatus.isConnected
          },
          userImpact: 'moderate'
        });
      } else {
        // Schedule retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, item.retryCount), 30000); // Max 30 seconds
        const timeoutId = setTimeout(() => {
          this.processQueueItem(item);
        }, delay);
        
        this.retryTimeouts.set(item.id, timeoutId);
      }
    } catch (error) {
      console.error(`Error processing queue item ${item.id}:`, error);
      
      await this.logError({
        type: 'api',
        severity: 'medium',
        message: `Queue processing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        context: {
          action: 'offline_queue_processing',
          network: this.connectionStatus.isConnected
        },
        userImpact: 'moderate'
      });
    }
  }

  // Process offline order
  private async processOfflineOrder(data: any): Promise<boolean> {
    try {
      // This would integrate with the restaurant context
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      return false;
    }
  }

  // Process offline booking
  private async processOfflineBooking(data: any): Promise<boolean> {
    try {
      // This would integrate with the hotel context
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      return false;
    }
  }

  // Process offline payment
  private async processOfflinePayment(data: any): Promise<boolean> {
    try {
      // This would integrate with the payment service
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      return false;
    }
  }

  // Process offline analytics
  private async processOfflineAnalytics(data: any): Promise<boolean> {
    try {
      await ghanaAnalyticsService.trackEvent(data);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Process offline SMS
  private async processOfflineSMS(data: any): Promise<boolean> {
    try {
      const result = await ghanaSMSService.sendSMS(data);
      return result.success;
    } catch (error) {
      return false;
    }
  }

  // Get error statistics
  getErrorStatistics(): {
    totalErrors: number;
    errorsByType: { [type: string]: number };
    errorsBySeverity: { [severity: string]: number };
    recentErrors: ErrorReport[];
    criticalErrors: ErrorReport[];
  } {
    const errorsByType: { [type: string]: number } = {};
    const errorsBySeverity: { [severity: string]: number } = {};

    this.errors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
    });

    return {
      totalErrors: this.errors.length,
      errorsByType,
      errorsBySeverity,
      recentErrors: this.errors.slice(-10),
      criticalErrors: this.errors.filter(e => e.severity === 'critical')
    };
  }

  // Get connection status
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  // Get offline queue status
  getOfflineQueueStatus(): {
    queueSize: number;
    pendingItems: OfflineQueueItem[];
    highPriorityCount: number;
  } {
    return {
      queueSize: this.offlineQueue.length,
      pendingItems: this.offlineQueue,
      highPriorityCount: this.offlineQueue.filter(item => item.priority === 'high').length
    };
  }

  // Ghana-specific error recovery
  async attemptGhanaSpecificRecovery(errorType: string): Promise<boolean> {
    try {
      switch (errorType) {
        case 'mobile_money_timeout':
          // Common issue in Ghana - mobile money timeouts
          return await this.handleMobileMoneyTimeout();
        
        case 'network_poor_quality':
          // Poor network conditions common in some Ghana areas
          return await this.handlePoorNetworkConditions();
        
        case 'sms_delivery_failed':
          // SMS delivery issues with Ghana networks
          return await this.handleSMSDeliveryFailure();
        
        default:
          return false;
      }
    } catch (error) {
      console.error('Ghana-specific recovery failed:', error);
      return false;
    }
  }

  // Handle mobile money timeout (common in Ghana)
  private async handleMobileMoneyTimeout(): Promise<boolean> {
    try {
      // Wait longer and retry mobile money verification
      await new Promise(resolve => setTimeout(resolve, 5000));
      return true;
    } catch (error) {
      return false;
    }
  }

  // Handle poor network conditions
  private async handlePoorNetworkConditions(): Promise<boolean> {
    try {
      // Reduce data usage, increase timeouts
      // This would adjust API call configurations
      return true;
    } catch (error) {
      return false;
    }
  }

  // Handle SMS delivery failure
  private async handleSMSDeliveryFailure(): Promise<boolean> {
    try {
      // Try alternative SMS provider or retry with different network
      return true;
    } catch (error) {
      return false;
    }
  }

  // Clear resolved errors
  async clearResolvedErrors(): Promise<void> {
    this.errors = this.errors.filter(error => !error.resolved);
    await this.saveErrors();
  }

  // Mark error as resolved
  async markErrorResolved(errorId: string): Promise<void> {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      await this.saveErrors();
    }
  }

  // Storage methods
  private async loadStoredData(): Promise<void> {
    try {
      const [storedErrors, storedQueue] = await Promise.all([
        AsyncStorage.getItem('error_reports'),
        AsyncStorage.getItem('offline_queue')
      ]);

      if (storedErrors) {
        const parsed = JSON.parse(storedErrors);
        this.errors = parsed.map((error: any) => ({
          ...error,
          timestamp: new Date(error.timestamp)
        }));
      }

      if (storedQueue) {
        const parsed = JSON.parse(storedQueue);
        this.offlineQueue = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load stored error data:', error);
    }
  }

  private async saveErrors(): Promise<void> {
    try {
      // Keep only recent errors to manage storage
      if (this.errors.length > this.maxErrorStorage) {
        this.errors = this.errors.slice(-this.maxErrorStorage);
      }
      
      await AsyncStorage.setItem('error_reports', JSON.stringify(this.errors));
    } catch (error) {
      console.error('Failed to save errors:', error);
    }
  }

  private async saveOfflineQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }
}

// Export singleton instance
export const errorHandlingService = new ErrorHandlingService();
export default errorHandlingService;