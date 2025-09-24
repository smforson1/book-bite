import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { User, Hotel, Room, Restaurant, MenuItem, Booking, Order, Review } from '../types';
import { storageService } from './storageService';

// API Configuration
const getBaseURL = () => {
  if (!__DEV__) {
    return 'http://UPDATE-THIS-TO-YOUR-ACTUAL-BACKEND-URL/api/v1';
  }

  // Development URLs for different platforms
  if (Platform.OS === 'android') {
    // Android emulator maps 10.0.2.2 to host machine's localhost
    return 'http://10.0.2.2:3000/api/v1';
  } else {
    // iOS Simulator - try localhost first, then 127.0.0.1 as fallback
    return 'http://localhost:3000/api/v1';
  }
};

// Fallback URLs to try if primary URL fails
const getFallbackURLs = () => {
  if (!__DEV__) return [];

  const fallbacks = [];

  if (Platform.OS === 'ios') {
    fallbacks.push(
      'http://127.0.0.1:3000/api/v1',
      'http://0.0.0.0:3000/api/v1'
    );
  } else {
    fallbacks.push(
      'http://localhost:3000/api/v1',
      'http://127.0.0.1:3000/api/v1'
    );
  }

  return fallbacks;
};

const API_CONFIG = {
  baseURL: getBaseURL(),
  fallbackURLs: getFallbackURLs(),
  timeout: 10000,
  retryAttempts: 3,
};

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface ApiError {
  message: string;
  status: number;
  code?: string;
}

class ApiService {
  public baseURL: string;
  private fallbackURLs: string[];
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.fallbackURLs = API_CONFIG.fallbackURLs;
    this.timeout = API_CONFIG.timeout;
    this.retryAttempts = API_CONFIG.retryAttempts;

    // Debug logging for development
    if (__DEV__) {
      console.log(`🌐 API Service initialized with baseURL: ${this.baseURL}`);
      console.log(`📱 Platform: ${Platform.OS}`);
      console.log(`🔄 Fallback URLs: ${this.fallbackURLs.join(', ')}`);

      // Test connectivity on initialization
      this.testConnectivity();
    }
  }

  private async testConnectivity(): Promise<void> {
    console.log('🔍 Testing backend connectivity...');

    const urlsToTest = [this.baseURL, ...this.fallbackURLs];
    let workingURL = null;

    for (const baseURL of urlsToTest) {
      try {
        const healthURL = baseURL.replace('/api/v1', '/health');
        console.log(`   Testing: ${healthURL}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(healthURL, {
          method: 'GET',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          console.log(`   ✅ ${baseURL} - Backend is accessible`);
          workingURL = baseURL;
          break;
        } else {
          console.log(`   ⚠️ ${baseURL} - Backend responded with status: ${response.status}`);
        }
      } catch (error: any) {
        console.log(`   ❌ ${baseURL} - ${error.message}`);
      }
    }

    if (workingURL) {
      if (workingURL !== this.baseURL) {
        console.log(`🔄 Updating primary URL to working URL: ${workingURL}`);
        this.baseURL = workingURL;
      }
      console.log('✅ Backend connectivity established');
    } else {
      console.log('❌ No working backend URL found');
      console.log('💡 Troubleshooting tips:');
      console.log('   - Ensure backend is running: cd backend && npm run dev');
      console.log('   - Check network connectivity');
      if (Platform.OS === 'android') {
        console.log('   - For Android emulator, try: adb reverse tcp:3000 tcp:3000');
      }
    }
  }

  async getAuthToken(): Promise<string | null> {
    try {
      const token = await storageService.getAuthToken();
      if (__DEV__) {
        console.log('🔑 Auth token retrieved:', token ? 'Token exists' : 'No token found');
      }
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async makeRequestWithFallback<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    requiresAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const urlsToTry = [this.baseURL, ...this.fallbackURLs];

    for (const baseURL of urlsToTry) {
      const result = await this.makeRequestToURL<T>(baseURL, endpoint, method, data, requiresAuth);
      if (result.success) {
        // Update baseURL if a fallback worked
        if (baseURL !== this.baseURL) {
          console.log(`✅ Fallback URL worked, updating baseURL to: ${baseURL}`);
          this.baseURL = baseURL;
        }
        return result;
      }
    }

    return {
      success: false,
      error: `All connection attempts failed. Tried: ${urlsToTry.join(', ')}`
    };
  }

  private async makeRequestToURL<T>(
    baseURL: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    requiresAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = `${baseURL}${endpoint}`;
    const token = requiresAuth ? await this.getAuthToken() : null;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    // Don't set Content-Type for FormData - let the browser set it with boundary
    const isFormData = data instanceof FormData;
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      if (__DEV__) {
        console.log('🔐 Adding auth header to request:', url);
      }
    } else if (requiresAuth) {
      if (__DEV__) {
        console.warn('⚠️ No auth token available for authenticated request:', url);
      }
    }

    const config: RequestInit = {
      method,
      headers,
      body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result.data, message: result.message };
    } catch (error: any) {
      const errorMessage = error.message || 'Network request failed';

      // Special handling for rate limiting
      if (error.message?.includes('429') || errorMessage.includes('Too many requests')) {
        console.warn(`🚨 Rate limited on ${baseURL}:`, errorMessage);
        return {
          success: false,
          error: 'Rate limited - please wait a moment and try again',
        };
      }

      console.warn(`🚨 Request to ${baseURL} failed:`, errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    requiresAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.makeRequestWithFallback<T>(endpoint, method, data, requiresAuth);
  }

  // Authentication APIs
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.makeRequest('/auth/login', 'POST', { email, password }, false);
  }

  async register(userData: Partial<User>, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.makeRequest('/auth/register', 'POST', { ...userData, password }, false);
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.makeRequest('/auth/refresh', 'POST');
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.makeRequest('/auth/logout', 'POST');
  }

  // Hotel APIs
  async getHotels(filters?: any): Promise<ApiResponse<Hotel[]>> {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    const response = await this.makeRequest<{ hotels: Hotel[] }>(`/hotels${queryParams}`, 'GET', undefined, false);

    // Extract hotels array from nested response structure
    if (response.success && response.data?.hotels) {
      return { success: true, data: response.data.hotels };
    }
    return { success: false, error: response.error || 'No hotels found' };
  }

  async getHotelById(id: string): Promise<ApiResponse<Hotel>> {
    return this.makeRequest(`/hotels/${id}`, 'GET', undefined, false);
  }

  async getMyHotels(): Promise<ApiResponse<Hotel[]>> {
    return this.makeRequest(`/hotels/owner/my-hotels`);
  }

  async getRoomsByHotelId(hotelId: string): Promise<ApiResponse<Room[]>> {
    const response = await this.makeRequest<{ rooms: Room[] }>(`/hotels/${hotelId}/rooms`, 'GET', undefined, false);

    // Extract rooms array from nested response structure
    if (response.success && response.data?.rooms) {
      return { success: true, data: response.data.rooms };
    }
    return { success: false, error: response.error || 'No rooms found' };
  }

  async getMyRooms(): Promise<ApiResponse<Room[]>> {
    return this.makeRequest(`/rooms/owner/my-rooms`);
  }

  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<ApiResponse<Booking>> {
    return this.makeRequest('/bookings', 'POST', bookingData);
  }

  async getUserBookings(): Promise<ApiResponse<Booking[]>> {
    const response = await this.makeRequest<{ bookings: Booking[] }>('/bookings/user');

    // Extract bookings array from nested response structure
    if (response.success && response.data?.bookings) {
      return { success: true, data: response.data.bookings };
    }
    return { success: false, error: response.error || 'No bookings found' };
  }

  async getMyBookings(): Promise<ApiResponse<Booking[]>> {
    return this.makeRequest('/bookings');
  }

  async updateBookingStatus(bookingId: string, status: Booking['status']): Promise<ApiResponse<Booking>> {
    return this.makeRequest(`/bookings/${bookingId}/status`, 'PUT', { status });
  }

  // Restaurant APIs
  async getRestaurants(filters?: any): Promise<ApiResponse<Restaurant[]>> {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    const response = await this.makeRequest<{ restaurants: Restaurant[] }>(`/restaurants${queryParams}`, 'GET', undefined, false);

    // Extract restaurants array from nested response structure
    if (response.success && response.data?.restaurants) {
      return { success: true, data: response.data.restaurants };
    }
    return { success: false, error: response.error || 'No restaurants found' };
  }

  async getRestaurantById(id: string): Promise<ApiResponse<Restaurant>> {
    return this.makeRequest(`/restaurants/${id}`, 'GET', undefined, false);
  }

  async getMyRestaurants(): Promise<ApiResponse<Restaurant[]>> {
    return this.makeRequest(`/restaurants/owner/my-restaurants`);
  }

  async getMenuByRestaurantId(restaurantId: string): Promise<ApiResponse<MenuItem[]>> {
    const response = await this.makeRequest<{ menuItems: MenuItem[] }>(`/restaurants/${restaurantId}/menu`, 'GET', undefined, false);

    // Extract menu items array from nested response structure
    if (response.success && response.data?.menuItems) {
      // Fix the restaurantId field - backend returns it as populated object, we need just the ID
      const fixedMenuItems = response.data.menuItems.map(item => ({
        ...item,
        restaurantId: typeof item.restaurantId === 'object'
          ? (item.restaurantId as any).id || (item.restaurantId as any)._id
          : item.restaurantId
      }));

      return { success: true, data: fixedMenuItems };
    }
    return { success: false, error: response.error || 'No menu items found' };
  }

  async getMyMenuItems(): Promise<ApiResponse<MenuItem[]>> {
    return this.makeRequest(`/menu-items/owner/my-items`);
  }

  async createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<ApiResponse<Order>> {
    return this.makeRequest('/orders', 'POST', orderData);
  }

  async getUserOrders(): Promise<ApiResponse<Order[]>> {
    const response = await this.makeRequest<{ orders: Order[] }>('/orders/user');

    // Extract orders array from nested response structure
    if (response.success && response.data?.orders) {
      return { success: true, data: response.data.orders };
    }
    return { success: false, error: response.error || 'No orders found' };
  }

  async getMyOrders(): Promise<ApiResponse<Order[]>> {
    return this.makeRequest('/orders');
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<ApiResponse<Order>> {
    return this.makeRequest(`/orders/${orderId}/status`, 'PUT', { status });
  }

  // Payment APIs
  async initiatePayment(paymentData: {
    amount: number;
    currency: string;
    paymentMethod: string;
    referenceId: string;
    type: 'booking' | 'order';
  }): Promise<ApiResponse<{ payment: any; paymentUrl?: string; accessCode?: string }>> {
    return this.makeRequest('/payments/initiate', 'POST', paymentData);
  }

  async verifyPayment(transactionId: string): Promise<ApiResponse<{ payment: any }>> {
    return this.makeRequest(`/payments/verify/${transactionId}`, 'GET');
  }

  async getPaymentHistory(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentMethod?: string;
  }): Promise<ApiResponse<{ payments: any[] }>> {
    const queryParams = filters ? `?${new URLSearchParams(filters as any).toString()}` : '';
    return this.makeRequest(`/payments/history${queryParams}`, 'GET');
  }

  async getPaymentMethods(): Promise<ApiResponse<{ paymentMethods: any[] }>> {
    return this.makeRequest('/payments/methods');
  }

  // Legacy method for backward compatibility
  async processPayment(paymentData: {
    amount: number;
    currency: string;
    paymentMethodId: string;
    referenceId: string;
    type: 'booking' | 'order';
  }): Promise<ApiResponse<{ transactionId: string; status: string }>> {
    const response = await this.initiatePayment({
      amount: paymentData.amount,
      currency: paymentData.currency,
      paymentMethod: paymentData.paymentMethodId,
      referenceId: paymentData.referenceId,
      type: paymentData.type
    });

    // Transform the response to match the legacy format
    if (response.success && response.data?.payment) {
      return {
        success: true,
        data: {
          transactionId: response.data.payment.transactionId || response.data.payment.id,
          status: response.data.payment.status || 'pending'
        },
        message: response.message
      };
    }

    return {
      success: false,
      error: response.error || 'Payment initiation failed'
    };
  }

  // Review APIs
  async getReviews(filters?: {
    targetId?: string;
    targetType?: 'hotel' | 'restaurant';
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'rating' | 'helpful';
    minRating?: number;
    verifiedOnly?: boolean;
  }): Promise<ApiResponse<{ reviews: Review[]; ratingDistribution?: any }>> {
    const queryParams = filters ? `?${new URLSearchParams(filters as any).toString()}` : '';
    return this.makeRequest(`/reviews${queryParams}`);
  }

  async createReview(reviewData: {
    targetId: string;
    targetType: 'hotel' | 'restaurant';
    rating: number;
    title: string;
    comment: string;
  }, images?: any[]): Promise<ApiResponse<{ review: Review }>> {
    const formData = new FormData();

    // Add review data
    Object.keys(reviewData).forEach(key => {
      formData.append(key, (reviewData as any)[key]);
    });

    // Add images if provided
    if (images && images.length > 0) {
      images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: 'image/jpeg',
          name: `review-image-${index}.jpg`,
        } as any);
      });
    }

    return this.makeRequest('/reviews', 'POST', formData);
  }

  async updateReview(reviewId: string, updates: {
    rating?: number;
    title?: string;
    comment?: string;
  }, images?: any[]): Promise<ApiResponse<{ review: Review }>> {
    const formData = new FormData();

    // Add update data
    Object.keys(updates).forEach(key => {
      formData.append(key, (updates as any)[key]);
    });

    // Add images if provided
    if (images && images.length > 0) {
      images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: 'image/jpeg',
          name: `review-image-${index}.jpg`,
        } as any);
      });
    }

    return this.makeRequest(`/reviews/${reviewId}`, 'PUT', formData);
  }

  async deleteReview(reviewId: string): Promise<ApiResponse<void>> {
    return this.makeRequest(`/reviews/${reviewId}`, 'DELETE');
  }

  async markReviewHelpful(reviewId: string): Promise<ApiResponse<{ review: Review }>> {
    return this.makeRequest(`/reviews/${reviewId}/helpful`, 'POST');
  }

  async getUserReviews(filters?: {
    targetType?: 'hotel' | 'restaurant';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ reviews: Review[] }>> {
    const queryParams = filters ? `?${new URLSearchParams(filters as any).toString()}` : '';
    return this.makeRequest(`/reviews/user${queryParams}`);
  }

  async getReviewStats(targetId: string, targetType: 'hotel' | 'restaurant'): Promise<ApiResponse<{
    averageRating: number;
    totalReviews: number;
    verifiedReviews: number;
    ratingDistribution: { [key: number]: number };
  }>> {
    return this.makeRequest(`/reviews/stats?targetId=${targetId}&targetType=${targetType}`);
  }

  // File upload
  async uploadFile(file: any, category: string): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    // Use the generic upload endpoint
    return this.makeRequest('/upload', 'POST', formData);
  }

  // Upload APIs
  async uploadImage(imageUri: string, category: 'hotel' | 'restaurant' | 'review' | 'profile'): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    } as any);
    formData.append('category', category);

    const token = await this.getAuthToken();
    const response = await fetch(`${this.baseURL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const result = await response.json();
    return { success: response.ok, data: result.data, error: result.error };
  }

  // Search APIs
  async searchHotels(query: string, filters?: any): Promise<ApiResponse<Hotel[]>> {
    const params = new URLSearchParams({ q: query, ...filters });
    return this.makeRequest(`/search/hotels?${params.toString()}`);
  }

  async searchRestaurants(query: string, filters?: any): Promise<ApiResponse<Restaurant[]>> {
    const params = new URLSearchParams({ q: query, ...filters });
    return this.makeRequest(`/search/restaurants?${params.toString()}`);
  }

  // Location APIs
  async getNearbyHotels(latitude: number, longitude: number, radius: number = 10): Promise<ApiResponse<Hotel[]>> {
    return this.makeRequest(`/location/hotels/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
  }

  async getNearbyRestaurants(latitude: number, longitude: number, radius: number = 10): Promise<ApiResponse<Restaurant[]>> {
    return this.makeRequest(`/location/restaurants/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
  }

  // Admin APIs
  async getAnalytics(dateRange: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/admin/analytics?range=${dateRange}`);
  }

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return this.makeRequest('/admin/users');
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<ApiResponse<User>> {
    return this.makeRequest(`/admin/users/${userId}/status`, 'PUT', { isActive });
  }

  // Restaurant management APIs
  async createRestaurant(restaurantData: Omit<Restaurant, 'id' | 'createdAt'>): Promise<ApiResponse<Restaurant>> {
    return this.makeRequest('/restaurants', 'POST', restaurantData);
  }

  async updateRestaurant(restaurantId: string, updates: Partial<Restaurant>): Promise<ApiResponse<Restaurant>> {
    return this.makeRequest(`/restaurants/${restaurantId}`, 'PUT', updates);
  }

  async createMenuItem(menuItemData: Omit<MenuItem, 'id'>): Promise<ApiResponse<MenuItem>> {
    return this.makeRequest('/menu-items', 'POST', menuItemData);
  }

  async updateMenuItem(menuItemId: string, updates: Partial<MenuItem>): Promise<ApiResponse<MenuItem>> {
    return this.makeRequest(`/menu-items/${menuItemId}`, 'PUT', updates);
  }

  async updateRoom(roomId: string, updates: Partial<Room>): Promise<ApiResponse<Room>> {
    return this.makeRequest(`/rooms/${roomId}`, 'PUT', updates);
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.makeRequest(`/auth/profile`, 'PUT', updates);
  }

  // Notification APIs
  async registerPushToken(pushToken: string): Promise<ApiResponse<void>> {
    return this.makeRequest('/notifications/register-token', 'POST', { pushToken });
  }

  async unregisterPushToken(): Promise<ApiResponse<void>> {
    return this.makeRequest('/notifications/unregister-token', 'DELETE');
  }

  async sendTestNotification(data?: {
    title?: string;
    body?: string;
    data?: any;
  }): Promise<ApiResponse<void>> {
    return this.makeRequest('/notifications/test', 'POST', data);
  }

  async getNotificationSettings(): Promise<ApiResponse<{
    settings: {
      pushNotificationsEnabled: boolean;
      orderUpdates: boolean;
      bookingUpdates: boolean;
      paymentUpdates: boolean;
      promotions: boolean;
      emailNotifications: boolean;
    };
  }>> {
    return this.makeRequest('/notifications/settings');
  }

  async updateNotificationSettings(settings: {
    orderUpdates?: boolean;
    bookingUpdates?: boolean;
    paymentUpdates?: boolean;
    promotions?: boolean;
    emailNotifications?: boolean;
  }): Promise<ApiResponse<{ settings: any }>> {
    return this.makeRequest('/notifications/settings', 'PUT', settings);
  }

  // Hotel management APIs
  async createHotel(hotelData: Omit<Hotel, 'id' | 'createdAt'>): Promise<ApiResponse<Hotel>> {
    return this.makeRequest('/hotels', 'POST', hotelData);
  }

  async updateHotel(hotelId: string, updates: Partial<Hotel>): Promise<ApiResponse<Hotel>> {
    return this.makeRequest(`/hotels/${hotelId}`, 'PUT', updates);
  }

  async createRoom(roomData: Omit<Room, 'id'>): Promise<ApiResponse<Room>> {
    return this.makeRequest('/rooms', 'POST', roomData);
  }

}

export const apiService = new ApiService();
export type { ApiResponse, ApiError };