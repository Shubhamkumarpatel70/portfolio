const { exec } = require('child_process');

console.log('Stopping portfolio servers...');

// For Windows
if (process.platform === 'win32') {
  // Find and kill the backend server
  exec('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error listing processes: ${error.message}`);
      return;
    }
    
    const lines = stdout.split('\n');
    lines.forEach(line => {
      // Look for node processes running server.js or react-scripts
      if (line.includes('server.js') || line.includes('react-scripts')) {
        const match = line.match(/"node.exe","(\d+)"/);
        if (match && match[1]) {
          const pid = match[1];
          exec(`taskkill /F /PID ${pid}`, (killError, killStdout) => {
            if (killError) {
              console.error(`Error killing process ${pid}: ${killError.message}`);
            } else {
              console.log(`Killed process ${pid}: ${killStdout.trim()}`);
            }
          });
        }
      }
    });
  });
} 
// For Unix-based systems (Linux, macOS)
else {
  // Find and kill the backend server
  exec('pkill -f "node server.js"', (error, stdout, stderr) => {
    if (error && error.code !== 1) { // pkill returns 1 if no processes matched
      console.error(`Error stopping backend: ${error.message}`);
    } else {
      console.log('Backend server stopped');
    }
  });
  
  // Find and kill the frontend server
  exec('pkill -f "react-scripts start"', (error, stdout, stderr) => {
    if (error && error.code !== 1) { // pkill returns 1 if no processes matched
      console.error(`Error stopping frontend: ${error.message}`);
    } else {
      console.log('Frontend server stopped');
    }
  });
}