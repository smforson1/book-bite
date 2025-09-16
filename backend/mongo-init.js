// MongoDB initialization script for Docker
db = db.getSiblingDB('book-bite');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'name', 'role'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        role: {
          enum: ['user', 'hotel_owner', 'restaurant_owner', 'admin']
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

db.hotels.createIndex({ location: '2dsphere' });
db.hotels.createIndex({ ownerId: 1 });
db.hotels.createIndex({ isActive: 1 });
db.hotels.createIndex({ name: 'text', description: 'text' });

db.restaurants.createIndex({ location: '2dsphere' });
db.restaurants.createIndex({ ownerId: 1 });
db.restaurants.createIndex({ isActive: 1 });
db.restaurants.createIndex({ name: 'text', description: 'text' });

db.rooms.createIndex({ hotelId: 1, roomNumber: 1 }, { unique: true });
db.rooms.createIndex({ hotelId: 1 });
db.rooms.createIndex({ isAvailable: 1 });

db.menuitems.createIndex({ restaurantId: 1 });
db.menuitems.createIndex({ isAvailable: 1 });
db.menuitems.createIndex({ name: 'text', description: 'text' });

db.bookings.createIndex({ userId: 1 });
db.bookings.createIndex({ roomId: 1 });
db.bookings.createIndex({ hotelId: 1 });
db.bookings.createIndex({ status: 1 });
db.bookings.createIndex({ checkIn: 1, checkOut: 1 });

db.orders.createIndex({ userId: 1 });
db.orders.createIndex({ restaurantId: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });

db.reviews.createIndex({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });
db.reviews.createIndex({ targetId: 1, targetType: 1 });
db.reviews.createIndex({ rating: -1 });

db.payments.createIndex({ userId: 1 });
db.payments.createIndex({ transactionId: 1 }, { unique: true });
db.payments.createIndex({ status: 1 });

print('Database initialized successfully with indexes');