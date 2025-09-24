# BookBite Setup Guide

This guide will help you set up the complete BookBite application with all the new features.

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env file with your actual values (see Environment Variables section below)
# Start development server
npm run dev
```

### 2. Frontend Setup

```bash
# Install new dependencies
npm install

# Start Expo development server
npm start
```

## 🔧 Environment Variables Setup

### Required Environment Variables

Edit `backend/.env` with these values:

#### Database
```env
MONGODB_URI=mongodb://localhost:27017/bookbite
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookbite
```

#### JWT Secrets (Generate strong random strings)
```env
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_REFRESH_SECRET=your-refresh-token-secret-here-also-long-and-random
```

#### Cloudinary (Get from https://cloudinary.com/console)
```env
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

#### Paystack (Get from https://dashboard.paystack.com/#/settings/developer)
```env
PAYSTACK_SECRET_KEY=sk_test_your-paystack-secret-key
PAYSTACK_PUBLIC_KEY=pk_test_your-paystack-public-key
```

#### Expo Push Notifications (Get from https://expo.dev/accounts/[account]/settings/access-tokens)
```env
EXPO_ACCESS_TOKEN=your-expo-access-token-here
```

### Optional Environment Variables

#### MTN Mobile Money (Get from https://momodeveloper.mtn.com/)
```env
MTN_MOMO_SUBSCRIPTION_KEY=your-mtn-subscription-key
MTN_MOMO_API_USER=your-mtn-api-user
MTN_MOMO_API_KEY=your-mtn-api-key
```

#### Email (For notifications)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📱 Frontend Integration

### 1. Add New Screens to Navigation

Add these screens to your navigation:

```typescript
// In your navigation stack
import PaymentScreen from '../screens/PaymentScreen';
import PaymentVerificationScreen from '../screens/PaymentVerificationScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';

// Add to your stack navigator
<Stack.Screen name="Payment" component={PaymentScreen} />
<Stack.Screen name="PaymentVerification" component={PaymentVerificationScreen} />
<Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
```

### 2. Initialize Push Notifications

Add this to your main App component:

```typescript
import { notificationService } from './src/services/notificationService';

export default function App() {
  useEffect(() => {
    // Initialize push notifications
    notificationService.initialize();
    
    // Set up notification listeners
    const listeners = notificationService.setupNotificationListeners();
    
    return () => {
      // Clean up listeners
      listeners.foregroundSubscription.remove();
      listeners.responseSubscription.remove();
    };
  }, []);

  // ... rest of your app
}
```

### 3. Update Your Types

Add these types to your `src/types/index.ts`:

```typescript
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

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
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

export interface Payment {
  id: string;
  userId: string;
  orderId?: string;
  bookingId?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  createdAt: Date;
}
```

## 🔗 API Integration Examples

### Making a Payment

```typescript
import { apiService } from '../services/apiService';

const handlePayment = async () => {
  try {
    const response = await apiService.initiatePayment({
      amount: 50.00,
      currency: 'GHS',
      paymentMethod: 'paystack',
      referenceId: 'order_123',
      type: 'order'
    });

    if (response.success && response.data.paymentUrl) {
      // Open payment URL or navigate to payment screen
      Linking.openURL(response.data.paymentUrl);
    }
  } catch (error) {
    console.error('Payment error:', error);
  }
};
```

### Creating a Review

```typescript
const createReview = async () => {
  try {
    const response = await apiService.createReview({
      targetId: 'restaurant_123',
      targetType: 'restaurant',
      rating: 5,
      title: 'Excellent food!',
      comment: 'The food was amazing and delivery was fast.'
    });

    if (response.success) {
      console.log('Review created:', response.data.review);
    }
  } catch (error) {
    console.error('Review error:', error);
  }
};
```

### Managing Notifications

```typescript
import { notificationService } from '../services/notificationService';

// Enable push notifications
const enableNotifications = async () => {
  const success = await notificationService.initialize();
  if (success) {
    console.log('Push notifications enabled');
  }
};

// Send test notification
const sendTest = async () => {
  await notificationService.sendTestNotification();
};

// Update notification settings
const updateSettings = async () => {
  await notificationService.updateNotificationSettings({
    orderUpdates: true,
    bookingUpdates: true,
    promotions: false
  });
};
```

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Run tests
npm test

# Test specific endpoints
curl -X GET http://localhost:3000/api/v1/health
curl -X GET http://localhost:3000/api/v1/payments/methods
```

### Frontend Testing

```bash
# Test push notifications
# 1. Enable notifications in the app
# 2. Use the "Send Test Notification" button in settings
# 3. Check that notifications appear

# Test payments
# 1. Create an order or booking
# 2. Navigate to payment screen
# 3. Select payment method
# 4. Complete payment flow
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Push Notifications Not Working
- Ensure you're testing on a physical device (not simulator)
- Check that notification permissions are granted
- Verify EXPO_ACCESS_TOKEN is correct
- Check Expo console for any errors

#### 2. Payment Issues
- Verify Paystack keys are correct (test vs live)
- Check that webhook URLs are accessible
- Ensure payment amounts are in correct format

#### 3. Database Connection Issues
- Verify MongoDB is running (if local)
- Check MongoDB Atlas connection string (if cloud)
- Ensure database user has proper permissions

#### 4. Image Upload Issues
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper file types are being uploaded

### Debug Commands

```bash
# Check backend logs
cd backend && npm run dev

# Check MongoDB connection
mongosh "your-mongodb-uri"

# Test API endpoints
curl -X GET http://localhost:3000/api/v1/health

# Check Expo push token
# Look for console logs in your app when notifications initialize
```

## 📚 Next Steps

After setup, you can:

1. **Customize Payment Methods**: Add more payment providers
2. **Enhance Notifications**: Add more notification types
3. **Improve Reviews**: Add photo reviews, review moderation
4. **Add Analytics**: Track user behavior and business metrics
5. **Implement Search**: Add advanced search and filtering
6. **Add Social Features**: User profiles, social sharing

## 🆘 Support

If you encounter issues:

1. Check the console logs for errors
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that services (MongoDB, Cloudinary, etc.) are accessible
5. Review the API documentation in the backend code

## 🎉 You're Ready!

Your BookBite app now has:
- ✅ Complete order management
- ✅ Real payment processing
- ✅ Push notifications
- ✅ Review system
- ✅ Real-time updates
- ✅ Image uploads
- ✅ Ghana-specific features

Start the backend and frontend servers, and you're ready to test all the new features!