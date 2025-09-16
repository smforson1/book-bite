// Simple wrapper to run the backend sample data script
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Adding sample data to your Book Bite app...\n');

const process = spawn('node', ['scripts/add-sample-data.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit'
});

process.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Sample data added successfully!');
    console.log('🔄 Refresh your React Native app to see the new hotels and restaurants.');
  } else {
    console.log('\n❌ Failed to add sample data.');
    console.log('💡 Make sure your backend is running: cd backend && npm run dev');
  }
});