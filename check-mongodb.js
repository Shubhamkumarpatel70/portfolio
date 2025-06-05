const { exec } = require('child_process');
const mongoose = require('mongoose');

// Function to check if MongoDB is running
function checkMongoDB() {
  return new Promise((resolve) => {
    mongoose.connect('mongodb://localhost:27017/test', {
      serverSelectionTimeoutMS: 2000 // 2 seconds timeout
    })
    .then(() => {
      console.log('MongoDB is running');
      mongoose.connection.close();
      resolve(true);
    })
    .catch((err) => {
      console.log('MongoDB is not running:', err.message);
      resolve(false);
    });
  });
}

// Function to start MongoDB
function startMongoDB() {
  console.log('Attempting to start MongoDB...');
  
  // For Windows
  exec('net start MongoDB', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting MongoDB: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`MongoDB start stderr: ${stderr}`);
      return;
    }
    console.log(`MongoDB started: ${stdout}`);
  });
}

// Main function
async function main() {
  const isRunning = await checkMongoDB();
  
  if (!isRunning) {
    startMongoDB();
  }
}

main();