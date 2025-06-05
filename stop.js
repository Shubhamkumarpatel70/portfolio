const { exec } = require('child_process');

console.log('Stopping all Node.js processes...');

// For Windows
if (process.platform === 'win32') {
  exec('taskkill /F /IM node.exe', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error stopping processes: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`All Node.js processes have been stopped: ${stdout}`);
  });
} 
// For Unix-based systems (Linux, macOS)
else {
  exec('pkill -f node', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error stopping processes: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log('All Node.js processes have been stopped');
  });
}