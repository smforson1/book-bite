// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'hotel_owner' | 'restaurant_owner' | 'admin';
  phone?: string;
  avatar?: string;
  createdAt: Date;
}

// Hotel Types
export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  images: string[];
  amenities: string[];
  ownerId: string;
  rating: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Room {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
  roomNumber: string;
  type: 'single' | 'double' | 'suite' | 'deluxe';
}

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  hotelId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  paymentDate?: Date;
  createdAt: Date;
}

// Restaurant Types
export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  images: string[];
  cuisine: string[];
  ownerId: string;
  rating: number;
  isActive: boolean;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  createdAt: Date;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  isAvailable: boolean;
  ingredients: string[];
  allergens: string[];
  preparationTime: string;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: OrderItem[];
  totalPrice: number;
  deliveryAddress: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  paymentDate?: Date;
  estimatedDeliveryTime: Date;
  createdAt: Date;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

// Review and Rating Types
export interface Review {
  id: string;
  userId: string;
  targetId: string; // Hotel ID or Restaurant ID
  targetType: 'hotel' | 'restaurant';
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  images?: string[];
  isVerified: boolean; // Only users who have bookings/orders can review
  helpful: number; // Number of users who found this review helpful
  createdAt: Date;
  updatedAt?: Date;
}

export interface ReviewSummary {
  targetId: string;
  targetType: 'hotel' | 'restaurant';
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recentReviews: Review[];
}

// Navigation Types
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  UserTabs: undefined;
  AdminTabs: undefined;
  HotelTabs: undefined;
  RestaurantTabs: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type UserTabParamList = {
  Home: undefined;
  Hotels: undefined;
  Restaurants: undefined;
  Bookings: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  Users: undefined;
  Hotels: undefined;
  Restaurants: undefined;
  Bookings: undefined;
  Orders: undefined;
  Analytics: undefined;
};