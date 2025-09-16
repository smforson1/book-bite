const http = require('http');

console.log('🔍 Testing if Book Bite server is running...\n');

// Test health endpoint
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Server is running!');
    console.log(`📊 Status: ${res.statusCode}`);
    console.log(`📋 Response:`, JSON.parse(data));
    console.log('\n🎉 Your Book Bite backend is working perfectly!');
    console.log('\n📖 Available endpoints:');
    console.log('   🏥 Health Check: http://localhost:3000/health');
    console.log('   👤 Register User: POST http://localhost:3000/api/v1/auth/register');
    console.log('   🔐 Login: POST http://localhost:3000/api/v1/auth/login');
    console.log('   🏨 Hotels: GET http://localhost:3000/api/v1/hotels');
    console.log('   🍽️  Restaurants: GET http://localhost:3000/api/v1/restaurants');
    console.log('\n💡 Tip: Use Postman or curl to test these endpoints!');
  });
});

req.on('error', (error) => {
  if (error.code === 'ECONNREFUSED') {
    console.log('❌ Server is not running!');
    console.log('\n🚀 To start your server, run:');
    console.log('   npm run dev');
    console.log('\n⏳ Then run this test again.');
  } else {
    console.log('❌ Error:', error.message);
  }
});

req.on('timeout', () => {
  console.log('⏰ Request timed out - server might be starting up');
  req.destroy();
});

req.end();