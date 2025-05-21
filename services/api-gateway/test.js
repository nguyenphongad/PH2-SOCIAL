const fetch = require('node-fetch');
const AbortController = require('abort-controller');

// Config
const GATEWAY_URL = 'http://localhost:9999';
const AUTH_URL = 'http://localhost:5000';
const TEST_USERNAME = 'test';
const TEST_PASSWORD = 'test';

// Hàm test với timeout
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Test login trực tiếp
async function testLoginDirect() {
  console.log('\n--- Testing Direct Login ---');
  try {
    const response = await fetchWithTimeout(`${AUTH_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: TEST_USERNAME, password: TEST_PASSWORD })
    });
    
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test login qua gateway
async function testLoginGateway() {
  console.log('\n--- Testing Gateway Login ---');
  try {
    const response = await fetchWithTimeout(`${GATEWAY_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: TEST_USERNAME, password: TEST_PASSWORD })
    });
    
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Chạy tests
async function runTests() {
  console.log('=== API TESTS ===');
  await testLoginDirect();
  await testLoginGateway();
  console.log('\n=== DONE ===');
}

runTests();
