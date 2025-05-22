const fetch = require('node-fetch');

async function checkChatService() {
  const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:5555';
  
  console.log('Checking Chat Service health...');
  
  try {
    const response = await fetch(`${CHAT_SERVICE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Chat Service is healthy:', data);
    } else {
      console.error(`❌ Chat Service returned status: ${response.status}`);
      const text = await response.text();
      console.error('Response:', text);
    }
  } catch (error) {
    console.error('❌ Failed to connect to Chat Service:', error.message);
  }
  
  // Kiểm tra Socket.IO endpoint
  try {
    const response = await fetch(`${CHAT_SERVICE_URL}/socket.io/`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      timeout: 5000
    });
    
    if (response.ok || response.status === 400) { // Socket.IO endpoint thường trả về 400 khi truy cập trực tiếp
      console.log('✅ Socket.IO endpoint is available');
    } else {
      console.error(`❌ Socket.IO endpoint returned status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Failed to connect to Socket.IO endpoint:', error.message);
  }
}

checkChatService();
