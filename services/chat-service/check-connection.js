const fetch = require('node-fetch');

// Kiểm tra kết nối đến Chat Service
async function testChatService() {
  console.log('Testing Chat Service health endpoint...');
  try {
    const response = await fetch('http://localhost:5555/health');
    const data = await response.json();
    console.log('Health check successful:', data);
  } catch (error) {
    console.error('Health check failed:', error);
  }
}

// Kiểm tra socket.io connection
async function testSocketConnection() {
  console.log('Testing Socket.IO connection...');
  const io = require('socket.io-client');
  
  const socket = io('http://localhost:5555', {
    transports: ['websocket'],
    reconnection: true
  });
  
  socket.on('connect', () => {
    console.log('Socket connected successfully:', socket.id);
    // Disconnect after test
    setTimeout(() => {
      socket.disconnect();
      console.log('Socket disconnected');
    }, 1000);
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
}

// Run tests
async function runTests() {
  await testChatService();
  await testSocketConnection();
}

runTests();
