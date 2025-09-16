import { Hotel, Room, Restaurant, MenuItem, Booking, Order, User } from '../types';

// Mock Hotel Data
export const mockHotels: Hotel[] = [
  {
    id: '1',
    name: 'Grand Palace Hotel',
    description: 'Luxury 5-star hotel in the heart of the city with world-class amenities and exceptional service.',
    address: '123 Downtown Avenue, Metropolitan City',
    phone: '+1 (555) 123-4567',
    email: 'info@grandpalace.com',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'
    ],
    amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Room Service', 'Concierge'],
    ownerId: 'hotel_owner_1',
    rating: 4.8,
    isActive: true,
    createdAt: new Date('2023-01-15')
  },
  {
    id: '2',
    name: 'Ocean View Resort',
    description: 'Beautiful beachfront resort with stunning ocean views and premium amenities.',
    address: '456 Coastal Road, Seaside City',
    phone: '+1 (555) 234-5678',
    email: 'reservations@oceanview.com',
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
    ],
    amenities: ['WiFi', 'Beach Access', 'Pool', 'Spa', 'Water Sports', 'Restaurant', 'Bar'],
    ownerId: 'hotel_owner_2',
    rating: 4.6,
    isActive: true,
    createdAt: new Date('2023-02-20')
  },
  {
    id: '3',
    name: 'Mountain Lodge Retreat',
    description: 'Cozy mountain lodge perfect for nature lovers and adventure seekers.',
    address: '789 Mountain Trail, Alpine Valley',
    phone: '+1 (555) 345-6789',
    email: 'stay@mountainlodge.com',
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
    ],
    amenities: ['WiFi', 'Fireplace', 'Hiking Trails', 'Restaurant', 'Game Room', 'Parking'],
    ownerId: 'hotel_owner_3',
    rating: 4.4,
    isActive: true,
    createdAt: new Date('2023-03-10')
  },
  {
    id: '4',
    name: 'City Center Inn',
    description: 'Modern boutique hotel located in the business district with contemporary amenities.',
    address: '321 Business Plaza, Corporate District',
    phone: '+1 (555) 456-7890',
    email: 'bookings@citycenterinn.com',
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
    ],
    amenities: ['WiFi', 'Business Center', 'Gym', 'Restaurant', 'Meeting Rooms', 'Parking'],
    ownerId: 'hotel_owner_1',
    rating: 4.2,
    isActive: true,
    createdAt: new Date('2023-04-05')
  }
];

// Mock Room Data
export const mockRooms: Room[] = [
  // Grand Palace Hotel Rooms
  {
    id: 'room_1',
    hotelId: '1',
    name: 'Presidential Suite',
    description: 'Luxurious suite with panoramic city views, separate living area, and premium amenities.',
    price: 599,
    capacity: 4,
    amenities: ['King Bed', 'Living Room', 'Kitchenette', 'City View', 'Balcony', 'Premium WiFi'],
    images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
    isAvailable: true,
    roomNumber: '2001',
    type: 'suite'
  },
  {
    id: 'room_2',
    hotelId: '1',
    name: 'Deluxe King Room',
    description: 'Spacious room with king bed and modern amenities.',
    price: 299,
    capacity: 2,
    amenities: ['King Bed', 'City View', 'Work Desk', 'Mini Bar'],
    images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'],
    isAvailable: true,
    roomNumber: '1205',
    type: 'deluxe'
  },
  {
    id: 'room_3',
    hotelId: '1',
    name: 'Standard Double Room',
    description: 'Comfortable room with double bed and essential amenities.',
    price: 199,
    capacity: 2,
    amenities: ['Double Bed', 'WiFi', 'TV', 'Air Conditioning'],
    images: ['https://images.unsplash.com/photo-1586611292717-f828b167408c?w=800'],
    isAvailable: true,
    roomNumber: '805',
    type: 'double'
  },
  // Ocean View Resort Rooms
  {
    id: 'room_4',
    hotelId: '2',
    name: 'Ocean Suite',
    description: 'Luxurious suite with direct ocean view and private balcony.',
    price: 699,
    capacity: 4,
    amenities: ['King Bed', 'Ocean View', 'Private Balcony', 'Jacuzzi', 'Mini Bar'],
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
    isAvailable: true,
    roomNumber: '301',
    type: 'suite'
  },
  {
    id: 'room_5',
    hotelId: '2',
    name: 'Beachfront Room',
    description: 'Direct beach access with stunning ocean views.',
    price: 399,
    capacity: 2,
    amenities: ['Queen Bed', 'Ocean View', 'Beach Access', 'Mini Fridge'],
    images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'],
    isAvailable: true,
    roomNumber: '102',
    type: 'double'
  },
  // Mountain Lodge Rooms
  {
    id: 'room_6',
    hotelId: '3',
    name: 'Mountain Cabin',
    description: 'Rustic cabin with fireplace and mountain views.',
    price: 249,
    capacity: 6,
    amenities: ['2 Bedrooms', 'Fireplace', 'Mountain View', 'Kitchenette', 'Hiking Access'],
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
    isAvailable: true,
    roomNumber: 'C1',
    type: 'suite'
  },
  // City Center Inn Rooms
  {
    id: 'room_7',
    hotelId: '4',
    name: 'Business Suite',
    description: 'Modern suite designed for business travelers.',
    price: 349,
    capacity: 2,
    amenities: ['King Bed', 'Work Area', 'Meeting Space', 'High-Speed WiFi', 'Printer Access'],
    images: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'],
    isAvailable: true,
    roomNumber: '1501',
    type: 'deluxe'
  },
  {
    id: 'room_8',
    hotelId: '4',
    name: 'Standard Single',
    description: 'Compact room perfect for solo business travelers.',
    price: 149,
    capacity: 1,
    amenities: ['Single Bed', 'Work Desk', 'WiFi', 'Coffee Maker'],
    images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
    isAvailable: true,
    roomNumber: '908',
    type: 'single'
  }
];

// Mock Restaurant Data
export const mockRestaurants: Restaurant[] = [
  {
    id: 'rest_1',
    name: 'Bella Vista Italian',
    description: 'Authentic Italian cuisine with fresh ingredients and traditional recipes.',
    address: '567 Little Italy Street, Culinary District',
    phone: '+1 (555) 111-2222',
    email: 'orders@bellavista.com',
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'
    ],
    cuisine: ['Italian', 'Mediterranean'],
    ownerId: 'restaurant_owner_1',
    rating: 4.7,
    isActive: true,
    deliveryTime: '30-45 mins',
    deliveryFee: 4.99,
    minimumOrder: 25,
    createdAt: new Date('2023-01-20')
  },
  {
    id: 'rest_2',
    name: 'Dragon Palace',
    description: 'Premium Chinese restaurant specializing in Cantonese and Szechuan cuisine.',
    address: '890 Chinatown Boulevard, Heritage Quarter',
    phone: '+1 (555) 222-3333',
    email: 'info@dragonpalace.com',
    images: [
      'https://images.unsplash.com/photo-1552566618-dfd06380d008?w=800',
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800'
    ],
    cuisine: ['Chinese', 'Asian'],
    ownerId: 'restaurant_owner_2',
    rating: 4.5,
    isActive: true,
    deliveryTime: '25-40 mins',
    deliveryFee: 3.99,
    minimumOrder: 20,
    createdAt: new Date('2023-02-10')
  },
  {
    id: 'rest_3',
    name: 'Burger Haven',
    description: 'Gourmet burgers and American classics made with premium ingredients.',
    address: '234 Food Truck Lane, Downtown',
    phone: '+1 (555) 333-4444',
    email: 'hello@burgerhaven.com',
    images: [
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800',
      'https://images.unsplash.com/photo-1586816001966-79b736744398?w=800'
    ],
    cuisine: ['American', 'Fast Food'],
    ownerId: 'restaurant_owner_3',
    rating: 4.3,
    isActive: true,
    deliveryTime: '20-30 mins',
    deliveryFee: 2.99,
    minimumOrder: 15,
    createdAt: new Date('2023-03-15')
  },
  {
    id: 'rest_4',
    name: 'Sakura Sushi',
    description: 'Fresh sushi and Japanese specialties prepared by master chefs.',
    address: '678 Zen Garden Way, Japanese District',
    phone: '+1 (555) 444-5555',
    email: 'orders@sakurasushi.com',
    images: [
      'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800',
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800'
    ],
    cuisine: ['Japanese', 'Sushi'],
    ownerId: 'restaurant_owner_1',
    rating: 4.8,
    isActive: true,
    deliveryTime: '35-50 mins',
    deliveryFee: 5.99,
    minimumOrder: 30,
    createdAt: new Date('2023-04-01')
  },
  {
    id: 'rest_5',
    name: 'Taco Fiesta',
    description: 'Authentic Mexican tacos and traditional dishes with bold flavors.',
    address: '345 Mariachi Street, Latino Quarter',
    phone: '+1 (555) 555-6666',
    email: 'hola@tacofiesta.com',
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800'
    ],
    cuisine: ['Mexican', 'Latin American'],
    ownerId: 'restaurant_owner_2',
    rating: 4.4,
    isActive: true,
    deliveryTime: '25-35 mins',
    deliveryFee: 3.49,
    minimumOrder: 18,
    createdAt: new Date('2023-05-12')
  }
];

// Mock Menu Items
export const mockMenuItems: MenuItem[] = [
  // Bella Vista Italian
  {
    id: 'menu_1',
    restaurantId: 'rest_1',
    name: 'Margherita Pizza',
    description: 'Classic pizza with fresh mozzarella, tomato sauce, and basil',
    price: 18.99,
    category: 'Pizza',
    images: ['https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'],
    isAvailable: true,
    ingredients: ['Mozzarella', 'Tomato Sauce', 'Fresh Basil', 'Olive Oil'],
    allergens: ['Dairy', 'Gluten'],
    preparationTime: '15-20 mins'
  },
  {
    id: 'menu_2',
    restaurantId: 'rest_1',
    name: 'Spaghetti Carbonara',
    description: 'Creamy pasta with pancetta, eggs, and parmesan cheese',
    price: 22.99,
    category: 'Pasta',
    images: ['https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400'],
    isAvailable: true,
    ingredients: ['Spaghetti', 'Pancetta', 'Eggs', 'Parmesan', 'Black Pepper'],
    allergens: ['Dairy', 'Gluten', 'Eggs'],
    preparationTime: '12-15 mins'
  },
  {
    id: 'menu_3',
    restaurantId: 'rest_1',
    name: 'Tiramisu',
    description: 'Classic Italian dessert with coffee-soaked ladyfingers',
    price: 8.99,
    category: 'Dessert',
    images: ['https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400'],
    isAvailable: true,
    ingredients: ['Mascarpone', 'Coffee', 'Ladyfingers', 'Cocoa Powder'],
    allergens: ['Dairy', 'Gluten', 'Eggs'],
    preparationTime: '5 mins'
  },
  // Dragon Palace
  {
    id: 'menu_4',
    restaurantId: 'rest_2',
    name: 'Peking Duck',
    description: 'Traditional roasted duck served with pancakes and hoisin sauce',
    price: 32.99,
    category: 'Main Course',
    images: ['https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400'],
    isAvailable: true,
    ingredients: ['Duck', 'Pancakes', 'Hoisin Sauce', 'Scallions', 'Cucumber'],
    allergens: ['Gluten'],
    preparationTime: '25-30 mins'
  },
  {
    id: 'menu_5',
    restaurantId: 'rest_2',
    name: 'Kung Pao Chicken',
    description: 'Spicy stir-fried chicken with peanuts and vegetables',
    price: 19.99,
    category: 'Main Course',
    images: ['https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400'],
    isAvailable: true,
    ingredients: ['Chicken', 'Peanuts', 'Bell Peppers', 'Szechuan Peppercorns'],
    allergens: ['Nuts'],
    preparationTime: '15-18 mins'
  },
  // Burger Haven
  {
    id: 'menu_6',
    restaurantId: 'rest_3',
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with cheese, lettuce, tomato, and our special sauce',
    price: 14.99,
    category: 'Burgers',
    images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'],
    isAvailable: true,
    ingredients: ['Beef Patty', 'Cheese', 'Lettuce', 'Tomato', 'Onion', 'Special Sauce'],
    allergens: ['Dairy', 'Gluten'],
    preparationTime: '12-15 mins'
  },
  {
    id: 'menu_7',
    restaurantId: 'rest_3',
    name: 'Truffle Fries',
    description: 'Crispy fries with truffle oil and parmesan cheese',
    price: 9.99,
    category: 'Sides',
    images: ['https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400'],
    isAvailable: true,
    ingredients: ['Potatoes', 'Truffle Oil', 'Parmesan', 'Herbs'],
    allergens: ['Dairy'],
    preparationTime: '8-10 mins'
  },
  // Sakura Sushi
  {
    id: 'menu_8',
    restaurantId: 'rest_4',
    name: 'Salmon Sashimi',
    description: 'Fresh salmon sliced to perfection, served with wasabi and ginger',
    price: 24.99,
    category: 'Sashimi',
    images: ['https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400'],
    isAvailable: true,
    ingredients: ['Fresh Salmon', 'Wasabi', 'Pickled Ginger'],
    allergens: ['Fish'],
    preparationTime: '5-8 mins'
  },
  {
    id: 'menu_9',
    restaurantId: 'rest_4',
    name: 'Dragon Roll',
    description: 'Eel and cucumber topped with avocado and eel sauce',
    price: 16.99,
    category: 'Sushi Rolls',
    images: ['https://images.unsplash.com/photo-1553621042-f6e147245754?w=400'],
    isAvailable: true,
    ingredients: ['Eel', 'Cucumber', 'Avocado', 'Eel Sauce', 'Sesame Seeds'],
    allergens: ['Fish', 'Sesame'],
    preparationTime: '10-12 mins'
  },
  // Taco Fiesta
  {
    id: 'menu_10',
    restaurantId: 'rest_5',
    name: 'Carnitas Tacos',
    description: 'Slow-cooked pork with cilantro, onions, and lime',
    price: 12.99,
    category: 'Tacos',
    images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'],
    isAvailable: true,
    ingredients: ['Pork', 'Corn Tortillas', 'Cilantro', 'Onions', 'Lime'],
    allergens: [],
    preparationTime: '8-10 mins'
  },
  {
    id: 'menu_11',
    restaurantId: 'rest_5',
    name: 'Guacamole & Chips',
    description: 'Fresh avocado dip served with crispy tortilla chips',
    price: 7.99,
    category: 'Appetizers',
    images: ['https://images.unsplash.com/photo-1541544181051-e46607bc22a4?w=400'],
    isAvailable: true,
    ingredients: ['Avocado', 'Lime', 'Cilantro', 'Onions', 'Tortilla Chips'],
    allergens: [],
    preparationTime: '5 mins'
  }
];

// Mock Bookings
export const mockBookings: Booking[] = [
  {
    id: 'booking_1',
    userId: 'user_1',
    roomId: 'room_1',
    hotelId: '1',
    checkIn: new Date('2024-01-15'),
    checkOut: new Date('2024-01-17'),
    guests: 2,
    totalPrice: 1198,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: new Date('2023-12-20')
  },
  {
    id: 'booking_2',
    userId: 'user_2',
    roomId: 'room_4',
    hotelId: '2',
    checkIn: new Date('2024-02-01'),
    checkOut: new Date('2024-02-05'),
    guests: 2,
    totalPrice: 2796,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'booking_3',
    userId: 'user_1',
    roomId: 'room_6',
    hotelId: '3',
    checkIn: new Date('2024-03-10'),
    checkOut: new Date('2024-03-14'),
    guests: 4,
    totalPrice: 996,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: new Date('2024-02-01')
  }
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 'order_1',
    userId: 'user_1',
    restaurantId: 'rest_1',
    items: [
      { menuItemId: 'menu_1', quantity: 1, price: 18.99 },
      { menuItemId: 'menu_2', quantity: 1, price: 22.99 },
      { menuItemId: 'menu_3', quantity: 2, price: 8.99 }
    ],
    totalPrice: 59.96,
    deliveryAddress: '123 Main Street, Apt 4B, Downtown',
    status: 'delivered',
    paymentStatus: 'paid',
    estimatedDeliveryTime: new Date('2024-01-10T19:30:00'),
    createdAt: new Date('2024-01-10T18:15:00')
  },
  {
    id: 'order_2',
    userId: 'user_2',
    restaurantId: 'rest_4',
    items: [
      { menuItemId: 'menu_8', quantity: 1, price: 24.99 },
      { menuItemId: 'menu_9', quantity: 2, price: 16.99 }
    ],
    totalPrice: 58.97,
    deliveryAddress: '456 Oak Avenue, Suite 12, Uptown',
    status: 'preparing',
    paymentStatus: 'paid',
    estimatedDeliveryTime: new Date('2024-01-15T20:15:00'),
    createdAt: new Date('2024-01-15T19:30:00')
  },
  {
    id: 'order_3',
    userId: 'user_3',
    restaurantId: 'rest_3',
    items: [
      { menuItemId: 'menu_6', quantity: 2, price: 14.99 },
      { menuItemId: 'menu_7', quantity: 1, price: 9.99 }
    ],
    totalPrice: 39.97,
    deliveryAddress: '789 Pine Street, Building C, Midtown',
    status: 'confirmed',
    paymentStatus: 'paid',
    estimatedDeliveryTime: new Date('2024-01-16T18:45:00'),
    createdAt: new Date('2024-01-16T18:00:00')
  }
];

// Mock Users for testing
export const mockUsers: User[] = [
  {
    id: 'user_1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'user',
    phone: '+1 (555) 123-0001',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    createdAt: new Date('2023-01-01')
  },
  {
    id: 'user_2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    role: 'user',
    phone: '+1 (555) 123-0002',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    createdAt: new Date('2023-01-15')
  },
  {
    id: 'user_3',
    email: 'mike.wilson@example.com',
    name: 'Mike Wilson',
    role: 'user',
    phone: '+1 (555) 123-0003',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: new Date('2023-02-01')
  },
  {
    id: 'hotel_owner_1',
    email: 'owner1@hotels.com',
    name: 'Sarah Johnson',
    role: 'hotel_owner',
    phone: '+1 (555) 234-0001',
    createdAt: new Date('2023-01-01')
  },
  {
    id: 'hotel_owner_2',
    email: 'owner2@hotels.com',
    name: 'Robert Chen',
    role: 'hotel_owner',
    phone: '+1 (555) 234-0002',
    createdAt: new Date('2023-01-15')
  },
  {
    id: 'restaurant_owner_1',
    email: 'chef1@restaurants.com',
    name: 'Maria Rodriguez',
    role: 'restaurant_owner',
    phone: '+1 (555) 345-0001',
    createdAt: new Date('2023-01-01')
  },
  {
    id: 'restaurant_owner_2',
    email: 'chef2@restaurants.com',
    name: 'David Kim',
    role: 'restaurant_owner',
    phone: '+1 (555) 345-0002',
    createdAt: new Date('2023-01-15')
  },
  {
    id: 'admin_1',
    email: 'admin@bookbite.com',
    name: 'Admin User',
    role: 'admin',
    phone: '+1 (555) 999-0001',
    createdAt: new Date('2023-01-01')
  }
];

// Initialize function to populate contexts with mock data (only if no real data exists)
export const initializeMockData = async () => {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    
    // Check if we already have data (don't override real data from backend)
    const existingHotels = await AsyncStorage.default.getItem('hotels');
    const existingRestaurants = await AsyncStorage.default.getItem('restaurants');
    
    // Only initialize mock data if no real data exists
    if (!existingHotels || !existingRestaurants) {
      console.log('No existing data found, initializing with mock data...');
      
      // Set mock data only for missing items
      const promises = [];
      
      if (!existingHotels) {
        promises.push(AsyncStorage.default.setItem('hotels', JSON.stringify(mockHotels)));
        promises.push(AsyncStorage.default.setItem('rooms', JSON.stringify(mockRooms)));
        promises.push(AsyncStorage.default.setItem('bookings', JSON.stringify(mockBookings)));
      }
      
      if (!existingRestaurants) {
        promises.push(AsyncStorage.default.setItem('restaurants', JSON.stringify(mockRestaurants)));
        promises.push(AsyncStorage.default.setItem('menuItems', JSON.stringify(mockMenuItems)));
        promises.push(AsyncStorage.default.setItem('orders', JSON.stringify(mockOrders)));
      }
      
      await Promise.all(promises);
      console.log('Mock data initialized successfully');
    } else {
      console.log('Existing data found, skipping mock data initialization');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing mock data:', error);
    return false;
  }
};

// Function to reset all data
export const resetMockData = async () => {
  return await initializeMockData();
};