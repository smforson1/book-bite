# Book Bite Backend API

A comprehensive Node.js backend for a multi-role mobile application supporting hotel bookings and restaurant food ordering in Ghana.

## 🚀 Features

### Core Functionality
- **Multi-role Authentication**: Users, Hotel Owners, Restaurant Owners, and Admins
- **Hotel Booking System**: Complete hotel and room management with booking functionality
- **Restaurant Ordering System**: Restaurant and menu management with order processing
- **Real-time Updates**: WebSocket integration for live status updates
- **Payment Integration**: Ghana-specific payment methods (Paystack, MTN MoMo, PalmPay, etc.)
- **Review System**: User reviews and ratings for hotels and restaurants
- **Location Services**: GPS-based nearby discovery
- **File Upload**: Image management with Cloudinary integration

### Ghana-Specific Features
- **Payment Methods**: Paystack, PalmPay, MTN Mobile Money, Vodafone Cash, AirtelTigo Money
- **Currency**: Ghana Cedis (GHS) support
- **Phone Validation**: Ghanaian phone number format validation
- **Regional Support**: All 10 regions of Ghana
- **Localized Services**: Ghana-specific location and payment services

## 🛠 Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO for WebSocket connections
- **File Storage**: Cloudinary for image management
- **Payment**: Paystack, MTN MoMo, PalmPay integrations
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Winston for structured logging
- **Validation**: Express-validator for input validation

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd book-bite/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=3000
   API_VERSION=v1

   # Database
   MONGODB_URI=mongodb://localhost:27017/book-bite

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-refresh-token-secret-here
   JWT_REFRESH_EXPIRES_IN=30d

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret

   # Payment Gateways
   PAYSTACK_SECRET_KEY=sk_test_your-paystack-secret-key
   PAYSTACK_PUBLIC_KEY=pk_test_your-paystack-public-key
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🚀 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile
- `PUT /api/v1/auth/change-password` - Change password

### Hotels
- `GET /api/v1/hotels` - Get all hotels (with filters)
- `GET /api/v1/hotels/nearby` - Get nearby hotels
- `GET /api/v1/hotels/:id` - Get hotel by ID
- `POST /api/v1/hotels` - Create hotel (hotel_owner, admin)
- `PUT /api/v1/hotels/:id` - Update hotel (hotel_owner, admin)
- `DELETE /api/v1/hotels/:id` - Delete hotel (hotel_owner, admin)
- `GET /api/v1/hotels/owner/my-hotels` - Get my hotels (hotel_owner)
- `GET /api/v1/hotels/:hotelId/rooms` - Get hotel rooms

### Rooms
- `GET /api/v1/rooms/:id` - Get room by ID
- `GET /api/v1/rooms/:id/availability` - Check room availability
- `POST /api/v1/rooms` - Create room (hotel_owner, admin)
- `PUT /api/v1/rooms/:id` - Update room (hotel_owner, admin)
- `DELETE /api/v1/rooms/:id` - Delete room (hotel_owner, admin)
- `GET /api/v1/rooms/owner/my-rooms` - Get my rooms (hotel_owner)
- `PATCH /api/v1/rooms/:id/availability` - Update room availability

### Bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings` - Get all bookings (admin, hotel_owner)
- `GET /api/v1/bookings/user` - Get user bookings
- `GET /api/v1/bookings/:id` - Get booking by ID
- `PATCH /api/v1/bookings/:id/status` - Update booking status (hotel_owner, admin)
- `PATCH /api/v1/bookings/:id/cancel` - Cancel booking

### Restaurants
- `GET /api/v1/restaurants` - Get all restaurants (with filters)
- `GET /api/v1/restaurants/nearby` - Get nearby restaurants
- `GET /api/v1/restaurants/:id` - Get restaurant by ID
- `POST /api/v1/restaurants` - Create restaurant (restaurant_owner, admin)
- `PUT /api/v1/restaurants/:id` - Update restaurant (restaurant_owner, admin)
- `DELETE /api/v1/restaurants/:id` - Delete restaurant (restaurant_owner, admin)
- `GET /api/v1/restaurants/owner/my-restaurants` - Get my restaurants
- `GET /api/v1/restaurants/:restaurantId/menu` - Get restaurant menu

### Menu Items
- `GET /api/v1/menu-items/:id` - Get menu item by ID
- `POST /api/v1/menu-items` - Create menu item (restaurant_owner, admin)
- `PUT /api/v1/menu-items/:id` - Update menu item (restaurant_owner, admin)
- `DELETE /api/v1/menu-items/:id` - Delete menu item (restaurant_owner, admin)
- `GET /api/v1/menu-items/owner/my-items` - Get my menu items
- `PATCH /api/v1/menu-items/:id/availability` - Update item availability

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - Get all orders (admin, restaurant_owner)
- `GET /api/v1/orders/user` - Get user orders
- `GET /api/v1/orders/:id` - Get order by ID
- `PATCH /api/v1/orders/:id/status` - Update order status (restaurant_owner, admin)
- `PATCH /api/v1/orders/:id/cancel` - Cancel order

### Reviews
- `GET /api/v1/reviews` - Get reviews (with filters)
- `POST /api/v1/reviews` - Create review
- `GET /api/v1/reviews/:id` - Get review by ID
- `PUT /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review

### Payments
- `POST /api/v1/payments/process` - Process payment
- `GET /api/v1/payments/methods` - Get payment methods
- `POST /api/v1/payments/verify` - Verify payment

### File Upload
- `POST /api/v1/upload/image` - Upload image

### Search & Location
- `GET /api/v1/search/hotels` - Search hotels
- `GET /api/v1/search/restaurants` - Search restaurants
- `GET /api/v1/location/hotels/nearby` - Nearby hotels
- `GET /api/v1/location/restaurants/nearby` - Nearby restaurants

## 🔌 WebSocket Events

### Client to Server
- `join_order` - Join order room for tracking
- `leave_order` - Leave order room
- `join_booking` - Join booking room for updates
- `leave_booking` - Leave booking room
- `driver_location_update` - Update driver location (drivers only)

### Server to Client
- `order_update` - Order status update
- `booking_update` - Booking status update
- `driver_location` - Driver location update
- `menu_update` - Menu item availability update
- `room_update` - Room availability update
- `notification` - General notifications

## 🔐 Authentication & Authorization

### User Roles
- **user**: Regular customers (can book hotels, order food, leave reviews)
- **hotel_owner**: Hotel managers (can manage hotels, rooms, view bookings)
- **restaurant_owner**: Restaurant managers (can manage restaurants, menu, orders)
- **admin**: System administrators (full access to all resources)

### JWT Token Structure
```json
{
  "userId": "user_id",
  "email": "user@example.com",
  "role": "user_role"
}
```

## 💳 Payment Integration

### Supported Payment Methods
1. **Paystack** - Cards and Mobile Money
2. **MTN Mobile Money** - MTN network users
3. **PalmPay** - Digital wallet
4. **Vodafone Cash** - Vodafone network users
5. **AirtelTigo Money** - AirtelTigo network users

### Payment Flow
1. User initiates payment
2. System creates payment record
3. Payment gateway processes transaction
4. Webhook/callback updates payment status
5. Order/booking status updated accordingly

## 📊 Database Schema

### Collections
- **users** - User accounts and profiles
- **hotels** - Hotel information and details
- **rooms** - Hotel room inventory
- **bookings** - Hotel booking records
- **restaurants** - Restaurant information
- **menuitems** - Restaurant menu items
- **orders** - Food order records
- **reviews** - User reviews and ratings
- **payments** - Payment transaction records

### Indexes
- Geospatial indexes for location-based queries
- Text indexes for search functionality
- Compound indexes for performance optimization

## 🛡️ Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API abuse prevention
- **Input Validation** - Request data validation
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt for password security
- **File Upload Security** - File type and size validation

## 📝 Logging

Winston logger with multiple transports:
- Console logging for development
- File logging for production
- Error-specific log files
- HTTP request logging with Morgan

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build Docker image
docker build -t book-bite-backend .

# Run container
docker run -p 3000:3000 --env-file .env book-bite-backend
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Configure production payment gateway keys
- Set up proper CORS origins
- Configure production logging

## 📈 Performance Optimization

- Database indexing for fast queries
- Response compression with gzip
- Image optimization with Cloudinary
- Caching strategies for frequently accessed data
- Connection pooling for database
- Rate limiting to prevent abuse

## 🔧 Development

### Code Structure
```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic services
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── server.ts       # Main server file
```

### Development Commands
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Email: support@bookbite.gh
- Documentation: [API Docs](http://localhost:3000/api-docs)
- Issues: GitHub Issues

## 🗺️ Roadmap

- [ ] SMS notifications integration
- [ ] Email notification system
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Push notifications
- [ ] Advanced search filters
- [ ] Loyalty program integration
- [ ] Third-party delivery integration