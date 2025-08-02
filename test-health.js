const axios = require('axios');

// Test health endpoint
const HEALTH_URL = 'https://us-central1-ebiddlegame.cloudfunctions.net/api/health';

async function testHealth() {
  console.log('🏥 Testing Cloud Function health...');
  
  try {
    const response = await axios.get(HEALTH_URL, {
      timeout: 10000
    });
    
    console.log('✅ Health check successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Health check failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

// Run the test
testHealth(); 