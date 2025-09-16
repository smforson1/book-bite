import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Hotel, Room, Restaurant, MenuItem, Booking, Order, Review } from '../types';

// API Configuration
const API_CONFIG = {
  baseURL: __DEV__ ? 'http://localhost:3000/api/v1' : 'https://api.bookbite.com/api/v1',
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
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
    this.retryAttempts = API_CONFIG.retryAttempts;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('AUTH_TOKEN');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    requiresAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = requiresAuth ? await this.getAuthToken() : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
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
        console.warn(`API request attempt ${attempt} failed:`, error.message);

        if (attempt === this.retryAttempts) {
          return {
            success: false,
            error: error.message || 'Network request failed',
          };
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    return { success: false, error: 'Max retry attempts exceeded' };
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
    return this.makeRequest(`/hotels${queryParams}`);
  }

  async getHotelById(id: string): Promise<ApiResponse<Hotel>> {
    return this.makeRequest(`/hotels/${id}`);
  }

  async getRoomsByHotelId(hotelId: string): Promise<ApiResponse<Room[]>> {
    return this.makeRequest(`/hotels/${hotelId}/rooms`);
  }

  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<ApiResponse<Booking>> {
    return this.makeRequest('/bookings', 'POST', bookingData);
  }

  async getUserBookings(): Promise<ApiResponse<Booking[]>> {
    return this.makeRequest('/bookings/user');
  }

  async updateBookingStatus(bookingId: string, status: Booking['status']): Promise<ApiResponse<Booking>> {
    return this.makeRequest(`/bookings/${bookingId}/status`, 'PUT', { status });
  }

  // Restaurant APIs
  async getRestaurants(filters?: any): Promise<ApiResponse<Restaurant[]>> {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.makeRequest(`/restaurants${queryParams}`);
  }

  async getRestaurantById(id: string): Promise<ApiResponse<Restaurant>> {
    return this.makeRequest(`/restaurants/${id}`);
  }

  async getMenuByRestaurantId(restaurantId: string): Promise<ApiResponse<MenuItem[]>> {
    return this.makeRequest(`/restaurants/${restaurantId}/menu`);
  }

  async createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<ApiResponse<Order>> {
    return this.makeRequest('/orders', 'POST', orderData);
  }

  async getUserOrders(): Promise<ApiResponse<Order[]>> {
    return this.makeRequest('/orders/user');
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<ApiResponse<Order>> {
    return this.makeRequest(`/orders/${orderId}/status`, 'PUT', { status });
  }

  // Payment APIs
  async processPayment(paymentData: {
    amount: number;
    currency: string;
    paymentMethodId: string;
    referenceId: string;
    type: 'booking' | 'order';
  }): Promise<ApiResponse<{ transactionId: string; status: string }>> {
    return this.makeRequest('/payments/process', 'POST', paymentData);
  }

  async getPaymentMethods(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/payments/methods');
  }

  async savePaymentMethod(paymentMethodData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/payments/methods', 'POST', paymentMethodData);
  }

  // Review APIs
  async getReviews(targetId: string, targetType: 'hotel' | 'restaurant'): Promise<ApiResponse<Review[]>> {
    return this.makeRequest(`/reviews?targetId=${targetId}&targetType=${targetType}`);
  }

  async updateUserProfile(userId: string, userData: any): Promise<ApiResponse<User>> {
    return this.makeRequest(`/users/${userId}`, 'PUT', userData);
  }

  async createHotel(hotelData: Omit<Hotel, 'id' | 'createdAt'>): Promise<ApiResponse<Hotel>> {
    return this.makeRequest('/hotels', 'POST', hotelData);
  }

  async updateHotel(hotelId: string, updates: Partial<Hotel>): Promise<ApiResponse<Hotel>> {
    return this.makeRequest(`/hotels/${hotelId}`, 'PUT', updates);
  }

  async createRoom(roomData: Omit<Room, 'id'>): Promise<ApiResponse<Room>> {
    return this.makeRequest('/rooms', 'POST', roomData);
  }

  // File upload
  async uploadFile(file: any, category: string): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

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
}

export const apiService = new ApiService();
export type { ApiResponse, ApiError };