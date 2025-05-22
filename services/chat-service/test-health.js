const fetch = require('node-fetch');

async function testHealth() {
  try {
    console.log('Testing chat-service health endpoint...');
    const response = await fetch('http://localhost:5555/health');
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', data);
    } else {
      const text = await response.text();
      console.log('Error response:', text);
    }
  } catch (error) {
    console.error('Error testing health endpoint:', error.message);
  }
}

testHealth();
