const axios = require('axios');

// Test different endpoints
const BASE_URL = 'https://us-central1-ebiddlegame.cloudfunctions.net/api';

async function testRoutes() {
  console.log('🔍 Testing all available routes...');
  
      const routes = [
      { path: '/health', method: 'GET' }
    ];
  
  for (const route of routes) {
    try {
      console.log(`\n🧪 Testing ${route.method} ${route.path}...`);
      
      const url = `${BASE_URL}${route.path}`;
      const config = {
        method: route.method.toLowerCase(),
        url: url,
        timeout: 5000
      };
      
      if (route.method === 'POST') {
        config.data = { test: 'data' };
        config.headers = { 'Content-Type': 'application/json' };
      }
      
      const response = await axios(config);
      console.log(`✅ ${route.method} ${route.path} - Status: ${response.status}`);
      
    } catch (error) {
      console.log(`❌ ${route.method} ${route.path} - ${error.response?.status || error.message}`);
    }
  }
}

// Run the test
testRoutes(); 