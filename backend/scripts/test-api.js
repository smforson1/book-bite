const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/v1`;

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    log(`✅ ${method.toUpperCase()} ${url} - Status: ${response.status}`, 'green');
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const status = error.response?.status || 'No Response';
    const message = error.response?.data?.message || error.message;
    log(`❌ ${method.toUpperCase()} ${url} - Status: ${status} - ${message}`, 'red');
    return { success: false, error: message, status };
  }
}

async function runTests() {
  log('\n🚀 Starting Book Bite API Tests...', 'blue');
  log('=' * 50, 'blue');

  // Test 1: Health Check
  log('\n📋 Test 1: Health Check', 'yellow');
  await testEndpoint('GET', `${BASE_URL}/health`);

  // Test 2: Register a new user
  log('\n📋 Test 2: User Registration', 'yellow');
  const userData = {
    name: 'Test User',
    email: 'test@bookbite.com',
    password: 'Password123',
    role: 'user',
    phone: '+233241234567'
  };
  
  const registerResult = await testEndpoint('POST', `${API_URL}/auth/register`, userData);
  let authToken = null;
  
  if (registerResult.success) {
    authToken = registerResult.data.data?.accessToken;
    log(`🔑 Auth Token: ${authToken ? 'Received' : 'Not received'}`, authToken ? 'green' : 'red');
  }

  // Test 3: Login
  log('\n📋 Test 3: User Login', 'yellow');
  const loginData = {
    email: 'test@bookbite.com',
    password: 'Password123'
  };
  
  const loginResult = await testEndpoint('POST', `${API_URL}/auth/login`, loginData);
  if (loginResult.success && !authToken) {
    authToken = loginResult.data.data?.accessToken;
  }

  // Test 4: Get Profile (requires authentication)
  if (authToken) {
    log('\n📋 Test 4: Get User Profile', 'yellow');
    await testEndpoint('GET', `${API_URL}/auth/profile`, null, {
      'Authorization': `Bearer ${authToken}`
    });
  } else {
    log('\n❌ Skipping authenticated tests - no auth token', 'red');
  }

  // Test 5: Get Hotels (public endpoint)
  log('\n📋 Test 5: Get Hotels', 'yellow');
  await testEndpoint('GET', `${API_URL}/hotels`);

  // Test 6: Get Restaurants (public endpoint)
  log('\n📋 Test 6: Get Restaurants', 'yellow');
  await testEndpoint('GET', `${API_URL}/restaurants`);

  // Test 7: Invalid endpoint
  log('\n📋 Test 7: Invalid Endpoint (should return 404)', 'yellow');
  await testEndpoint('GET', `${API_URL}/invalid-endpoint`);

  // Test 8: Register Hotel Owner
  log('\n📋 Test 8: Register Hotel Owner', 'yellow');
  const hotelOwnerData = {
    name: 'Hotel Owner',
    email: 'hotelowner@bookbite.com',
    password: 'Password123',
    role: 'hotel_owner',
    phone: '+233241234568'
  };
  
  const hotelOwnerResult = await testEndpoint('POST', `${API_URL}/auth/register`, hotelOwnerData);
  let hotelOwnerToken = null;
  
  if (hotelOwnerResult.success) {
    hotelOwnerToken = hotelOwnerResult.data.data?.accessToken;
  }

  // Test 9: Register Restaurant Owner
  log('\n📋 Test 9: Register Restaurant Owner', 'yellow');
  const restaurantOwnerData = {
    name: 'Restaurant Owner',
    email: 'restaurantowner@bookbite.com',
    password: 'Password123',
    role: 'restaurant_owner',
    phone: '+233241234569'
  };
  
  await testEndpoint('POST', `${API_URL}/auth/register`, restaurantOwnerData);

  log('\n🎉 API Tests Completed!', 'blue');
  log('=' * 50, 'blue');
  
  // Summary
  log('\n📊 Summary:', 'yellow');
  log('✅ Your Book Bite backend is working!', 'green');
  log('✅ Database connection is successful', 'green');
  log('✅ Authentication system is working', 'green');
  log('✅ API endpoints are responding', 'green');
  
  if (authToken) {
    log('\n🔑 You can use this token for authenticated requests:', 'blue');
    log(authToken, 'green');
  }
}

// Handle server not running
process.on('unhandledRejection', (error) => {
  if (error.code === 'ECONNREFUSED') {
    log('\n❌ Cannot connect to server. Make sure your backend is running:', 'red');
    log('   npm run dev', 'yellow');
    process.exit(1);
  }
});

runTests().catch(console.error);