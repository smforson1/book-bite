import { Request } from 'express';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

// User Types
export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'hotel_owner' | 'restaurant_owner' | 'admin';
  phone?: string;
  avatar?: string;
  pushToken?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Hotel Types
export interface IHotel extends Document {
  _id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  images: string[];
  amenities: string[];
  ownerId: string | mongoose.Types.ObjectId;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  region: string;
  city: string;
  createdAt: Date;
  updatedAt: Date;
}

// Room Types
export interface IRoom extends Document {
  _id: string;
  hotelId: string | mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
  roomNumber: string;
  type: 'single' | 'double' | 'suite' | 'deluxe';
  createdAt: Date;
  updatedAt: Date;
}

// Booking Types
export interface IBooking extends Document {
  _id: string;
  userId: string | mongoose.Types.ObjectId;
  roomId: string | mongoose.Types.ObjectId;
  hotelId: string | mongoose.Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  paymentDate?: Date;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Restaurant Types
export interface IRestaurant extends Document {
  _id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  images: string[];
  cuisine: string[];
  ownerId: string | mongoose.Types.ObjectId;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  region: string;
  city: string;
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// MenuItem Types
export interface IMenuItem extends Document {
  _id: string;
  restaurantId: string | mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  isAvailable: boolean;
  ingredients: string[];
  allergens: string[];
  preparationTime: string;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export interface IOrderItem {
  menuItemId: string | mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface IOrder extends Document {
  _id: string;
  userId: string | mongoose.Types.ObjectId;
  restaurantId: string | mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalPrice: number;
  deliveryAddress: string;
  deliveryCoordinates: {
    latitude: number;
    longitude: number;
  };
  deliveryDetails?: {
    streetAddress?: string;
    apartmentNumber?: string;
    floor?: string;
    buildingName?: string;
    landmark?: string;
    contactPhone?: string;
    label?: string;
  };
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  paymentDate?: Date;
  estimatedDeliveryTime: Date;
  actualDeliveryTime?: Date;
  driverId?: string | mongoose.Types.ObjectId;
  deliveryInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Review Types
export interface IReview extends Document {
  _id: string;
  userId: string | mongoose.Types.ObjectId;
  targetId: string | mongoose.Types.ObjectId;
  targetType: 'hotel' | 'restaurant';
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerified: boolean;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export interface IPayment extends Document {
  _id: string;
  userId: string | mongoose.Types.ObjectId;
  orderId?: string | mongoose.Types.ObjectId;
  bookingId?: string | mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: 'paystack' | 'palmpay' | 'mtn_momo' | 'vodafone_cash' | 'airteltigo_money';
  transactionId: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  gatewayResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

// Request Types
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius?: number;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  amenities?: string[];
  cuisine?: string[];
  availability?: boolean;
}

// WebSocket Event Types
export interface SocketEvents {
  order_update: {
    orderId: string;
    status: string;
    estimatedTime?: Date;
  };
  booking_update: {
    bookingId: string;
    status: string;
  };
  driver_location: {
    orderId: string;
    location: {
      latitude: number;
      longitude: number;
    };
  };
  menu_update: {
    restaurantId: string;
    menuItemId: string;
    isAvailable: boolean;
  };
  room_update: {
    hotelId: string;
    roomId: string;
    isAvailable: boolean;
  };
  notification: {
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  };
}

// Ghana Specific Types
export interface GhanaLocation {
  region: string;
  city: string;
  coordinates?: [number, number];
}

export const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Central',
  'Eastern',
  'Northern',
  'Upper East',
  'Upper West',
  'Volta',
  'Brong Ahafo'
] as const;

export type GhanaRegion = typeof GHANA_REGIONS[number];

// Payment Method Types
export interface PaymentMethodConfig {
  name: string;
  type: 'card' | 'mobile_money' | 'bank_transfer';
  provider: string;
  isActive: boolean;
  supportedNetworks?: string[];
}

export const GHANA_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    name: 'MTN Mobile Money',
    type: 'mobile_money',
    provider: 'mtn',
    isActive: true,
    supportedNetworks: ['MTN']
  },
  {
    name: 'Vodafone Cash',
    type: 'mobile_money',
    provider: 'vodafone',
    isActive: true,
    supportedNetworks: ['Vodafone']
  },
  {
    name: 'AirtelTigo Money',
    type: 'mobile_money',
    provider: 'airteltigo',
    isActive: true,
    supportedNetworks: ['AirtelTigo']
  },
  {
    name: 'Paystack Cards',
    type: 'card',
    provider: 'paystack',
    isActive: true
  },
  {
    name: 'PalmPay',
    type: 'mobile_money',
    provider: 'palmpay',
    isActive: true
  }
];