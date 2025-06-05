const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

// Function to check if the server is running
function checkServerStatus() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/api/health', (res) => {
      if (res.statusCode === 200) {
        console.log('Backend server is already running.');
        resolve(true);
      } else {
        resolve(false);
      }
    });

    req.on('error', () => {
      console.log('Backend server is not running. Starting it now...');
      resolve(false);
    });

    req.end();
  });
}

// Function to start the server
function startServer() {
  const serverPath = path.join(__dirname, 'backend', 'server.js');
  
  console.log(`Starting server from: ${serverPath}`);
  
  const server = spawn('node', [serverPath], {
    detached: true,
    stdio: 'inherit'
  });
  
  server.unref();
  
  console.log(`Backend server started with PID: ${server.pid}`);
}

// Main function
async function main() {
  const isRunning = await checkServerStatus();
  
  if (!isRunning) {
    startServer();
  }
}

main();