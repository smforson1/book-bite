# BookBite - Hotel & Restaurant Booking App

BookBite is a comprehensive mobile application that allows users to discover, book hotels, and order food from restaurants. The app connects users with registered hotel and restaurant managers across Ghana.

## ✨ Features

### Core Features
- User registration and authentication with JWT
- Hotel browsing and booking system
- Restaurant browsing and food ordering
- Manager dashboard for hotels and restaurants with real statistics
- Real-time booking and order management via Socket.IO
- Dark mode support for all screens
- Image upload functionality for managers
- Ghana-specific features (GHS currency, local regions, payment methods)

### 🆕 Recently Completed Features

#### 1. Complete Order Management System
- ✅ Full order lifecycle management (pending → confirmed → preparing → ready → delivered)
- ✅ Real-time order status updates via Socket.IO
- ✅ Order history and tracking
- ✅ Restaurant order management dashboard

#### 2. Enhanced Payment Processing
- ✅ Multiple payment methods (Paystack, MTN MoMo, PalmPay)
- ✅ Payment verification and webhook handling
- ✅ Payment history and transaction tracking
- ✅ Secure payment processing with proper validation

#### 3. Push Notifications System
- ✅ Expo push notifications integration
- ✅ Real-time notifications for order updates
- ✅ Booking confirmation notifications
- ✅ Payment success notifications
- ✅ Notification preferences management

#### 4. Review & Rating System
- ✅ Hotel and restaurant reviews with ratings (1-5 stars)
- ✅ Photo reviews with image uploads
- ✅ Verified reviews for users who have used the service
- ✅ Review statistics and rating distribution
- ✅ Helpful review marking system

## 🚀 Setup Instructions

### Frontend Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Update the backend URL in `src/services/apiService.ts`:
   - Change `'http://UPDATE-THIS-TO-YOUR-ACTUAL-BACKEND-URL/api/v1'` to your actual backend URL
4. Start the development server: `npm start`

### Backend Setup
1. Navigate to backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create `.env` file with required environment variables:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/bookbite
   JWT_SECRET=your-jwt-secret-key
   JWT_REFRESH_SECRET=your-jwt-refresh-secret
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   PAYSTACK_SECRET_KEY=your-paystack-secret-key
   EXPO_ACCESS_TOKEN=your-expo-access-token
   ```
4. Start the development server: `npm run dev`

## 🔧 Backend Configuration

The backend now includes:
- Complete REST API with all CRUD operations
- Real-time Socket.IO integration
- Payment processing with multiple providers
- Push notification service
- Image upload with Cloudinary
- Comprehensive error handling and validation

## Development vs Production

- **Development Mode**: Uses mock data when backend is not available
- **Production Mode**: Only uses real data from your backend

## Manager Dashboard Features

- Real-time statistics for hotel managers:
  - Today's check-ins
  - Today's check-outs
  - Current occupancy rate
- Real-time statistics for restaurant managers:
  - Today's orders
  - Today's revenue
  - Active menu items count
- Image upload for hotels, rooms, restaurants, and menu items
- Dark mode toggle for better visibility

## Dark Mode

The app includes a dark mode feature that can be toggled from the manager dashboards. The selected theme is persisted between sessions.

## Ghana-Specific Features

- Ghana Cedis (GHS) currency support
- Ghanaian cities and regions
- Local payment methods (Paystack, PalmPay)
- Ghanaian phone number validation

## Testing

For testing purposes, the app includes mock data that can be used during development.

## Documentation

- [Dashboard Updates](DASHBOARD_UPDATES.md) - Details about real data implementation in manager dashboards
- [Dark Mode Feature](DARK_MODE_FEATURE.md) - Information about the dark mode implementation
- [Image Upload Features](IMAGE_UPLOAD_FEATURES.md) - Documentation for image upload functionality
## 🎯
 Implementation Status

### ✅ Completed (Immediate Next Steps)
1. **Order Management System** - Complete order lifecycle with real-time updates
2. **Payment Processing** - Multiple payment methods with verification
3. **Push Notifications** - Expo notifications for all major events
4. **Review System** - Complete rating and review functionality

### 🔄 Backend API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile

#### Orders
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders` - Get orders (filtered by user role)
- `GET /api/v1/orders/user` - Get user's orders
- `GET /api/v1/orders/restaurant` - Get restaurant's orders
- `PUT /api/v1/orders/:id/status` - Update order status
- `PUT /api/v1/orders/:id/cancel` - Cancel order

#### Payments
- `GET /api/v1/payments/methods` - Get available payment methods
- `POST /api/v1/payments/initiate` - Initiate payment
- `GET /api/v1/payments/verify/:transactionId` - Verify payment
- `GET /api/v1/payments/history` - Get payment history
- `POST /api/v1/payments/webhook/paystack` - Paystack webhook

#### Notifications
- `POST /api/v1/notifications/register-token` - Register push token
- `DELETE /api/v1/notifications/unregister-token` - Unregister push token
- `POST /api/v1/notifications/test` - Send test notification
- `GET /api/v1/notifications/settings` - Get notification settings
- `PUT /api/v1/notifications/settings` - Update notification settings

#### Reviews
- `POST /api/v1/reviews` - Create review (with image upload)
- `GET /api/v1/reviews` - Get reviews (with filtering)
- `GET /api/v1/reviews/user` - Get user's reviews
- `GET /api/v1/reviews/stats` - Get review statistics
- `PUT /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review
- `POST /api/v1/reviews/:id/helpful` - Mark review as helpful

## 📱 Frontend Integration Required

To complete the implementation, you'll need to:

### 1. Update Frontend Types
Add the new types to your frontend `types.ts`:
```typescript
// Add to existing types
export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: OrderItem[];
  totalPrice: number;
  deliveryAddress: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  estimatedDeliveryTime: Date;
  createdAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'hotel' | 'restaurant';
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerified: boolean;
  helpful: number;
  createdAt: Date;
}
```

### 2. Add Push Notification Setup
Install and configure Expo notifications:
```bash
npx expo install expo-notifications expo-device expo-constants
```

### 3. Create Missing Screens
- Payment screen with multiple payment methods
- Review creation and display screens
- Notification settings screen
- Enhanced order tracking screen

### 4. Update API Service
The `apiService.ts` already includes most endpoints, but you may need to add:
- Review endpoints
- Enhanced notification methods
- Payment verification methods

## 🔮 Next Recommended Features

1. **Advanced Search & Filtering** - Location-based search, cuisine filters
2. **Loyalty Program** - Points system and rewards
3. **Social Features** - Share orders, group bookings
4. **Analytics Dashboard** - Business intelligence for managers
5. **Multi-language Support** - Twi, Ga, Ewe support
6. **Offline Capabilities** - Cached data and offline queue

## 🛠️ Development Commands

### Backend
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm test            # Run tests
```

### Frontend
```bash
npm start           # Start Expo development server
npm run android     # Run on Android
npm run ios         # Run on iOS
npm run web         # Run on web
```

## 🔐 Security Features

- JWT authentication with refresh tokens
- Rate limiting on all endpoints
- Input validation and sanitization
- Secure file upload with Cloudinary
- Payment webhook verification
- User role-based access control

## 📊 Database Models

The backend now includes complete models for:
- User (with push token support)
- Hotel & Room
- Restaurant & MenuItem
- Booking & Order
- Payment & Review

All models include proper validation, indexing, and relationships.

---

**Status**: Backend implementation complete ✅  
**Next**: Frontend integration and UI enhancements  
**Priority**: Payment screen and notification setup