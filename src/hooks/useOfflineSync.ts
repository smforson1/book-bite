import { useState, useEffect } from 'react';
import { offlineManager } from '../services/offlineManager';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';
import { Booking, Order, Review } from '../types';

export const useOfflineSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Sync pending bookings
  const syncPendingBookings = async (): Promise<void> => {
    try {
      const pendingBookings = await storageService.getPendingBookings();
      
      if (pendingBookings.length === 0) return;
      
      setSyncProgress(0);
      const totalItems = pendingBookings.length;
      
      for (let i = 0; i < pendingBookings.length; i++) {
        const booking = pendingBookings[i];
        
        try {
          // Try to create the booking on the server
          const response = await apiService.createBooking({
            userId: booking.userId,
            hotelId: booking.hotelId,
            roomId: booking.roomId,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            guests: booking.guests,
            totalPrice: booking.totalPrice,
            status: booking.status || 'pending',
            paymentStatus: booking.paymentStatus || 'pending'
          });
          
          if (response.success && response.data) {
            // Remove from pending list
            await storageService.removePendingBooking(booking.id);
            
            // Update progress
            setSyncProgress(((i + 1) / totalItems) * 100);
          }
        } catch (error) {
          console.error(`Failed to sync booking ${booking.id}:`, error);
          // Keep in pending list for next sync attempt
        }
      }
    } catch (error) {
      console.error('Error syncing pending bookings:', error);
      throw error;
    }
  };

  // Sync pending orders
  const syncPendingOrders = async (): Promise<void> => {
    try {
      const pendingOrders = await storageService.getPendingOrders();
      
      if (pendingOrders.length === 0) return;
      
      const totalItems = pendingOrders.length;
      let processedItems = 0;
      
      for (const order of pendingOrders) {
        try {
          // Try to create the order on the server
          const response = await apiService.createOrder({
            userId: order.userId,
            restaurantId: order.restaurantId,
            items: order.items,
            deliveryAddress: order.deliveryAddress,
            totalPrice: order.totalPrice,
            estimatedDeliveryTime: order.estimatedDeliveryTime,
            status: order.status || 'pending',
            paymentStatus: order.paymentStatus || 'pending',
            deliveryCoordinates: order.deliveryCoordinates || {
              latitude: 0,
              longitude: 0
            }
          });
          
          if (response.success && response.data) {
            // Remove from pending list
            await storageService.removePendingOrder(order.id);
            
            // Update progress
            processedItems++;
            setSyncProgress((processedItems / totalItems) * 100);
          }
        } catch (error) {
          console.error(`Failed to sync order ${order.id}:`, error);
          // Keep in pending list for next sync attempt
        }
      }
    } catch (error) {
      console.error('Error syncing pending orders:', error);
      throw error;
    }
  };

  // Sync pending reviews
  const syncPendingReviews = async (): Promise<void> => {
    try {
      const pendingReviews = await storageService.getPendingReviews();
      
      if (pendingReviews.length === 0) return;
      
      const totalItems = pendingReviews.length;
      let processedItems = 0;
      
      for (const review of pendingReviews) {
        try {
          // Try to create the review on the server
          const response = await apiService.createReview({
            targetId: review.targetId,
            targetType: review.targetType,
            rating: review.rating,
            title: review.title,
            comment: review.comment
          });
          
          if (response.success && response.data) {
            // Remove from pending list
            await storageService.removePendingReview(review.id);
            
            // Update progress
            processedItems++;
            setSyncProgress((processedItems / totalItems) * 100);
          }
        } catch (error) {
          console.error(`Failed to sync review ${review.id}:`, error);
          // Keep in pending list for next sync attempt
        }
      }
    } catch (error) {
      console.error('Error syncing pending reviews:', error);
      throw error;
    }
  };

  // Perform full sync
  const performSync = async (): Promise<void> => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      // Sync all pending items
      await syncPendingBookings();
      await syncPendingOrders();
      await syncPendingReviews();
      
      // Trigger a full sync in the offline manager
      await offlineManager.triggerSync();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during sync';
      setSyncError(errorMessage);
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  // Auto-sync when coming online
  useEffect(() => {
    const handleNetworkChange = (isOnline: boolean) => {
      if (isOnline) {
        // Automatically sync when coming online
        performSync();
      }
    };
    
    offlineManager.on('networkStatusChange', handleNetworkChange);
    
    return () => {
      offlineManager.off('networkStatusChange', handleNetworkChange);
    };
  }, []);

  return {
    isSyncing,
    syncProgress,
    syncError,
    performSync,
    syncPendingBookings,
    syncPendingOrders,
    syncPendingReviews
  };
};