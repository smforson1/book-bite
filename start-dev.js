const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Book Bite Development Environment...\n');

// Function to run a command in a specific directory
function runCommand(command, args, cwd, label, color = '\x1b[36m') {
  const process = spawn(command, args, {
    cwd,
    stdio: 'pipe',
    shell: true
  });

  process.stdout.on('data', (data) => {
    console.log(`${color}[${label}]\x1b[0m ${data.toString().trim()}`);
  });

  process.stderr.on('data', (data) => {
    console.log(`${color}[${label}]\x1b[0m ${data.toString().trim()}`);
  });

  process.on('close', (code) => {
    console.log(`${color}[${label}]\x1b[0m Process exited with code ${code}`);
  });

  return process;
}

// Start backend
console.log('🔧 Starting Backend Server...');
const backendProcess = runCommand(
  'npm', 
  ['run', 'dev'], 
  path.join(__dirname, 'backend'),
  'BACKEND',
  '\x1b[32m' // Green
);

// Wait a bit for backend to start, then start frontend
setTimeout(() => {
  console.log('\n📱 Starting Frontend App...');
  const frontendProcess = runCommand(
    'npm', 
    ['start'], 
    __dirname,
    'FRONTEND',
    '\x1b[34m' // Blue
  );
}, 3000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development environment...');
  backendProcess.kill();
  process.exit();
});

console.log('\n📋 Development Environment Started!');
console.log('🔗 Backend API: http://localhost:3000');
console.log('📱 Frontend: Will open in Expo');
console.log('\n💡 Press Ctrl+C to stop both servers');
console.log('\n🧪 In your app, use the "Test Backend Connection" button to verify everything is working!');