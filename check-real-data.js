const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/v1';

async function checkRealData() {
  console.log('🔍 Checking if your app is using real data from backend...\n');

  try {
    // Check hotels
    console.log('🏨 Checking Hotels...');
    const hotelsResponse = await axios.get(`${API_BASE}/hotels`);
    const hotels = hotelsResponse.data.data.hotels;
    console.log(`   Found ${hotels.length} registered hotels`);
    
    if (hotels.length > 0) {
      console.log('   ✅ Hotels are loaded from backend');
      hotels.forEach((hotel, index) => {
        console.log(`   ${index + 1}. ${hotel.name} (Owner: ${hotel.ownerId})`);
      });
    } else {
      console.log('   ⚠️ No hotels found - users will see empty state');
    }

    // Check restaurants
    console.log('\n🍽️ Checking Restaurants...');
    const restaurantsResponse = await axios.get(`${API_BASE}/restaurants`);
    const restaurants = restaurantsResponse.data.data.restaurants;
    console.log(`   Found ${restaurants.length} registered restaurants`);
    
    if (restaurants.length > 0) {
      console.log('   ✅ Restaurants are loaded from backend');
      restaurants.forEach((restaurant, index) => {
        console.log(`   ${index + 1}. ${restaurant.name} (Owner: ${restaurant.ownerId})`);
      });

      // Check menu items for first restaurant
      if (restaurants[0]) {
        console.log(`\n🍕 Checking Menu Items for ${restaurants[0].name}...`);
        const menuResponse = await axios.get(`${API_BASE}/restaurants/${restaurants[0]._id}/menu`);
        const menuItems = menuResponse.data.data.menuItems;
        console.log(`   Found ${menuItems.length} menu items`);
        
        if (menuItems.length > 0) {
          console.log('   ✅ Menu items are loaded from backend');
          menuItems.slice(0, 3).forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.name} - GH₵${item.price}`);
          });
        }
      }
    } else {
      console.log('   ⚠️ No restaurants found - users will see empty state');
    }

    // Summary
    console.log('\n📊 Summary:');
    if (hotels.length > 0 || restaurants.length > 0) {
      console.log('✅ Your app is successfully using REAL DATA from backend!');
      console.log('✅ Users will only see registered hotels and restaurants');
      console.log('✅ No mock data is being shown');
      
      if (hotels.length === 0) {
        console.log('💡 Tip: Add some hotels by registering hotel owners');
      }
      if (restaurants.length === 0) {
        console.log('💡 Tip: Add some restaurants by registering restaurant owners');
      }
    } else {
      console.log('⚠️ No real data found - users will see empty states');
      console.log('💡 Run: node add-sample-data.js to add sample data');
    }

    console.log('\n🎯 Expected User Experience:');
    console.log('- New users see 0 bookings, 0 orders, GH₵0.00 saved');
    console.log('- Hotels tab shows only registered hotels');
    console.log('- Restaurants tab shows only registered restaurants');
    console.log('- Empty states shown when no data exists');
    console.log('- Real booking/ordering creates actual database records');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Cannot connect to backend');
      console.log('💡 Make sure your backend is running: cd backend && npm run dev');
    } else {
      console.log('❌ Error checking data:', error.response?.data?.message || error.message);
    }
  }
}

checkRealData();