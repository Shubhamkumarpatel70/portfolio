const { spawn } = require('child_process');
const path = require('path');

// Function to start the backend server
function startBackend() {
  console.log('Starting backend server...');
  const backendPath = path.join(__dirname, 'backend');
  
  const backend = spawn('node', ['server.js'], {
    cwd: backendPath,
    detached: true,
    stdio: 'inherit',
    shell: true
  });
  
  backend.unref();
  console.log(`Backend server started with PID: ${backend.pid}`);
}

// Function to start the frontend server
function startFrontend() {
  console.log('Starting frontend server...');
  const frontendPath = path.join(__dirname, 'frontend');
  
  // Use 'npx' instead of 'npm' for better compatibility
  const frontend = spawn('npx', ['--no-install', 'react-scripts', 'start'], {
    cwd: frontendPath,
    detached: true,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: '3000' }
  });
  
  frontend.unref();
  console.log(`Frontend server started with PID: ${frontend.pid}`);
}

// Main function
function main() {
  // Start backend first
  startBackend();
  
  // Wait a bit for the backend to initialize before starting frontend
  setTimeout(() => {
    startFrontend();
  }, 3000);
  
  console.log('Both servers have been started. Press Ctrl+C to exit this script.');
  console.log('Note: The servers will continue running in the background.');
}

main();