const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/v1';

// Sample data for Ghana
const sampleHotels = [
  {
    name: 'Golden Tulip Accra',
    description: 'Luxury hotel in the heart of Accra with modern amenities and excellent service.',
    address: 'Liberation Road, Airport Residential Area, Accra',
    phone: '+233302123456',
    email: 'info@goldentulipaccra.com',
    amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Spa', 'Conference Room'],
    region: 'Greater Accra',
    city: 'Accra',
    location: {
      coordinates: [-0.1870, 5.6037] // [longitude, latitude] for Accra
    }
  },
  {
    name: 'Kempinski Hotel Gold Coast City',
    description: 'Premium beachfront hotel offering world-class luxury and stunning ocean views.',
    address: 'Gamel Abdul Nasser Avenue, Accra',
    phone: '+233302654321',
    email: 'reservations@kempinski-accra.com',
    amenities: ['WiFi', 'Beach Access', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Spa'],
    region: 'Greater Accra',
    city: 'Accra',
    location: {
      coordinates: [-0.2008, 5.5502]
    }
  },
  {
    name: 'Royal Senchi Resort',
    description: 'Beautiful lakeside resort perfect for relaxation and water activities.',
    address: 'Senchi, Akosombo, Eastern Region',
    phone: '+233244567890',
    email: 'info@royalsenchi.com',
    amenities: ['WiFi', 'Lake View', 'Pool', 'Restaurant', 'Bar', 'Water Sports'],
    region: 'Eastern',
    city: 'Akosombo',
    location: {
      coordinates: [0.0500, 6.2667]
    }
  }
];

const sampleRestaurants = [
  {
    name: 'Buka Restaurant',
    description: 'Authentic Ghanaian cuisine in a traditional setting. Famous for our jollof rice and grilled tilapia.',
    address: 'East Legon, Accra',
    phone: '+233244111222',
    email: 'info@bukarestaurant.com',
    cuisine: ['Ghanaian', 'West African', 'Grilled'],
    deliveryTime: '30-45 minutes',
    deliveryFee: 15.00,
    minimumOrder: 50.00,
    region: 'Greater Accra',
    city: 'Accra',
    location: {
      coordinates: [-0.1307, 5.6500]
    }
  },
  {
    name: 'Santoku Japanese Restaurant',
    description: 'Premium Japanese dining experience with fresh sushi and authentic flavors.',
    address: 'Airport Residential Area, Accra',
    phone: '+233302333444',
    email: 'reservations@santoku.gh',
    cuisine: ['Japanese', 'Sushi', 'Asian'],
    deliveryTime: '45-60 minutes',
    deliveryFee: 20.00,
    minimumOrder: 80.00,
    region: 'Greater Accra',
    city: 'Accra',
    location: {
      coordinates: [-0.1870, 5.6037]
    }
  },
  {
    name: 'Mama Mia Pizzeria',
    description: 'Wood-fired pizzas and Italian classics made with love and fresh ingredients.',
    address: 'Osu, Accra',
    phone: '+233244555666',
    email: 'orders@mamamiagh.com',
    cuisine: ['Italian', 'Pizza', 'Mediterranean'],
    deliveryTime: '25-40 minutes',
    deliveryFee: 12.00,
    minimumOrder: 40.00,
    region: 'Greater Accra',
    city: 'Accra',
    location: {
      coordinates: [-0.1307, 5.5560]
    }
  }
];

const sampleRooms = [
  // Golden Tulip Accra rooms
  {
    hotelName: 'Golden Tulip Accra',
    name: 'Deluxe Room',
    description: 'Spacious room with city view and modern amenities',
    price: 250.00,
    capacity: 2,
    amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Safe'],
    roomNumber: '101',
    type: 'deluxe'
  },
  {
    hotelName: 'Golden Tulip Accra',
    name: 'Executive Suite',
    description: 'Luxury suite with separate living area and premium amenities',
    price: 450.00,
    capacity: 4,
    amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Safe', 'Balcony', 'Living Room'],
    roomNumber: '201',
    type: 'suite'
  },
  // Kempinski rooms
  {
    hotelName: 'Kempinski Hotel Gold Coast City',
    name: 'Ocean View Room',
    description: 'Beautiful room with stunning ocean views',
    price: 350.00,
    capacity: 2,
    amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Safe', 'Ocean View'],
    roomNumber: '301',
    type: 'deluxe'
  },
  // Royal Senchi rooms
  {
    hotelName: 'Royal Senchi Resort',
    name: 'Lake View Chalet',
    description: 'Charming chalet with direct lake access',
    price: 180.00,
    capacity: 3,
    amenities: ['WiFi', 'AC', 'TV', 'Lake View', 'Balcony'],
    roomNumber: '401',
    type: 'single'
  }
];

const sampleMenuItems = [
  // Buka Restaurant menu
  {
    restaurantName: 'Buka Restaurant',
    name: 'Jollof Rice with Grilled Chicken',
    description: 'Our signature jollof rice served with perfectly grilled chicken',
    price: 35.00,
    category: 'Main Course',
    ingredients: ['Rice', 'Chicken', 'Tomatoes', 'Onions', 'Spices'],
    allergens: [],
    preparationTime: '20-25 minutes'
  },
  {
    restaurantName: 'Buka Restaurant',
    name: 'Grilled Tilapia with Banku',
    description: 'Fresh tilapia grilled to perfection, served with traditional banku',
    price: 45.00,
    category: 'Main Course',
    ingredients: ['Tilapia', 'Banku', 'Pepper Sauce', 'Onions'],
    allergens: ['Fish'],
    preparationTime: '25-30 minutes'
  },
  // Santoku menu
  {
    restaurantName: 'Santoku Japanese Restaurant',
    name: 'Salmon Sashimi Set',
    description: 'Fresh salmon sashimi with wasabi and pickled ginger',
    price: 65.00,
    category: 'Sashimi',
    ingredients: ['Fresh Salmon', 'Wasabi', 'Pickled Ginger', 'Soy Sauce'],
    allergens: ['Fish'],
    preparationTime: '10-15 minutes'
  },
  {
    restaurantName: 'Santoku Japanese Restaurant',
    name: 'Chicken Teriyaki Bento',
    description: 'Grilled chicken teriyaki with rice and vegetables',
    price: 55.00,
    category: 'Bento',
    ingredients: ['Chicken', 'Rice', 'Vegetables', 'Teriyaki Sauce'],
    allergens: ['Soy'],
    preparationTime: '15-20 minutes'
  },
  // Mama Mia menu
  {
    restaurantName: 'Mama Mia Pizzeria',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
    price: 40.00,
    category: 'Pizza',
    ingredients: ['Pizza Dough', 'Tomato Sauce', 'Mozzarella', 'Basil'],
    allergens: ['Gluten', 'Dairy'],
    preparationTime: '15-20 minutes'
  },
  {
    restaurantName: 'Mama Mia Pizzeria',
    name: 'Pepperoni Pizza',
    description: 'Popular pizza topped with pepperoni and mozzarella cheese',
    price: 48.00,
    category: 'Pizza',
    ingredients: ['Pizza Dough', 'Tomato Sauce', 'Mozzarella', 'Pepperoni'],
    allergens: ['Gluten', 'Dairy'],
    preparationTime: '15-20 minutes'
  }
];

async function createUser(userData) {
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, userData);
    if (response.data.success) {
      console.log(`✅ Created user: ${userData.name} (${userData.email})`);
      return response.data.data;
    }
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log(`⚠️ User already exists: ${userData.email}`);
      // Try to login instead
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: userData.email,
        password: userData.password
      });
      return loginResponse.data.data;
    } else {
      console.error(`❌ Failed to create user ${userData.email}:`, error.response?.data?.message || error.message);
    }
  }
  return null;
}

async function createHotel(hotelData, token) {
  try {
    const response = await axios.post(`${API_BASE}/hotels`, hotelData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.data.success) {
      console.log(`✅ Created hotel: ${hotelData.name}`);
      return response.data.data.hotel;
    }
  } catch (error) {
    console.error(`❌ Failed to create hotel ${hotelData.name}:`, error.response?.data?.message || error.message);
  }
  return null;
}

async function createRestaurant(restaurantData, token) {
  try {
    const response = await axios.post(`${API_BASE}/restaurants`, restaurantData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.data.success) {
      console.log(`✅ Created restaurant: ${restaurantData.name}`);
      return response.data.data.restaurant;
    }
  } catch (error) {
    console.error(`❌ Failed to create restaurant ${restaurantData.name}:`, error.response?.data?.message || error.message);
  }
  return null;
}

async function addSampleData() {
  console.log('🚀 Adding sample data to Book Bite backend...\n');

  try {
    // Create hotel owners
    console.log('👤 Creating hotel owners...');
    const hotelOwner1 = await createUser({
      name: 'Golden Tulip Manager',
      email: 'manager@goldentulip.com',
      password: 'Password123',
      role: 'hotel_owner',
      phone: '+233244111111'
    });

    const hotelOwner2 = await createUser({
      name: 'Kempinski Manager',
      email: 'manager@kempinski.com',
      password: 'Password123',
      role: 'hotel_owner',
      phone: '+233244222222'
    });

    const hotelOwner3 = await createUser({
      name: 'Royal Senchi Manager',
      email: 'manager@royalsenchi.com',
      password: 'Password123',
      role: 'hotel_owner',
      phone: '+233244333333'
    });

    // Create restaurant owners
    console.log('\n🍽️ Creating restaurant owners...');
    const restaurantOwner1 = await createUser({
      name: 'Buka Owner',
      email: 'owner@buka.com',
      password: 'Password123',
      role: 'restaurant_owner',
      phone: '+233244444444'
    });

    const restaurantOwner2 = await createUser({
      name: 'Santoku Owner',
      email: 'owner@santoku.com',
      password: 'Password123',
      role: 'restaurant_owner',
      phone: '+233244555555'
    });

    const restaurantOwner3 = await createUser({
      name: 'Mama Mia Owner',
      email: 'owner@mamamia.com',
      password: 'Password123',
      role: 'restaurant_owner',
      phone: '+233244666666'
    });

    // Create hotels
    console.log('\n🏨 Creating hotels...');
    const createdHotels = [];
    const hotelOwners = [hotelOwner1, hotelOwner2, hotelOwner3];
    
    for (let i = 0; i < sampleHotels.length; i++) {
      if (hotelOwners[i]) {
        const hotel = await createHotel(sampleHotels[i], hotelOwners[i].accessToken);
        if (hotel) createdHotels.push(hotel);
      }
    }

    // Create restaurants
    console.log('\n🍽️ Creating restaurants...');
    const createdRestaurants = [];
    const restaurantOwners = [restaurantOwner1, restaurantOwner2, restaurantOwner3];
    
    for (let i = 0; i < sampleRestaurants.length; i++) {
      if (restaurantOwners[i]) {
        const restaurant = await createRestaurant(sampleRestaurants[i], restaurantOwners[i].accessToken);
        if (restaurant) createdRestaurants.push(restaurant);
      }
    }

    console.log('\n🎉 Sample data added successfully!');
    console.log(`📊 Summary:`);
    console.log(`   👥 Users: ${hotelOwners.length + restaurantOwners.length}`);
    console.log(`   🏨 Hotels: ${createdHotels.length}`);
    console.log(`   🍽️ Restaurants: ${createdRestaurants.length}`);
    console.log('\n💡 You can now see these hotels and restaurants in your app!');
    console.log('🔄 Refresh your app to load the new data.');

  } catch (error) {
    console.error('❌ Error adding sample data:', error.message);
    console.log('\n💡 Make sure your backend is running: cd backend && npm run dev');
  }
}

// Check if backend is running first
async function checkBackend() {
  try {
    const response = await axios.get('http://localhost:3000/health');
    if (response.data.success) {
      console.log('✅ Backend is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Backend is not running. Please start it first:');
    console.log('   cd backend && npm run dev');
    return false;
  }
}

// Run the script
checkBackend().then(isRunning => {
  if (isRunning) {
    addSampleData();
  }
});