const axios = require('axios');

async function testConnection() {
  console.log('🔗 Testing Frontend-Backend Connection...\n');
  
  const API_BASE = 'http://localhost:3000/api/v1';
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Health Check:', healthResponse.data.message);
    
    // Test 2: Register a user (same as frontend would do)
    console.log('\n2️⃣ Testing User Registration...');
    const userData = {
      name: 'Frontend Test User',
      email: 'frontend@bookbite.com',
      password: 'Password123',
      role: 'user',
      phone: '+233241234567'
    };
    
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, userData);
    console.log('✅ Registration successful!');
    console.log(`👤 User: ${registerResponse.data.data.user.name}`);
    console.log(`🔑 Token received: ${registerResponse.data.data.accessToken ? 'Yes' : 'No'}`);
    
    // Test 3: Login (same as frontend would do)
    console.log('\n3️⃣ Testing Login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: userData.email,
      password: userData.password
    });
    console.log('✅ Login successful!');
    
    const token = loginResponse.data.data.accessToken;
    
    // Test 4: Get Profile (authenticated request)
    console.log('\n4️⃣ Testing Authenticated Request...');
    const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile retrieved successfully!');
    console.log(`👤 Profile: ${profileResponse.data.data.user.name}`);
    
    // Test 5: Get Hotels (public endpoint)
    console.log('\n5️⃣ Testing Hotels Endpoint...');
    const hotelsResponse = await axios.get(`${API_BASE}/hotels`);
    console.log(`✅ Hotels endpoint working! Found ${hotelsResponse.data.data.hotels.length} hotels`);
    
    console.log('\n🎉 All tests passed! Your frontend can now connect to the backend!');
    console.log('\n📱 Next steps:');
    console.log('1. Start your React Native app');
    console.log('2. Try registering/logging in');
    console.log('3. The app should now use real data from your backend!');
    
  } catch (error) {
    if (error.response) {
      console.log(`❌ API Error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      console.log('❌ Network Error: Cannot connect to backend');
      console.log('💡 Make sure your backend is running: npm run dev');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testConnection();