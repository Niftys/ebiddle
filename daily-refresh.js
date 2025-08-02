const axios = require('axios');

// Configuration
const BASE_URL = 'https://us-central1-ebiddlegame.cloudfunctions.net/api';
const AUTH_TOKEN = process.env.CACHE_RESET_TOKEN;

// Validate required environment variable
if (!AUTH_TOKEN) {
  console.error('❌ Error: CACHE_RESET_TOKEN environment variable is required');
  console.log('💡 Please set your token:');
  console.log('   export CACHE_RESET_TOKEN=your_token_here');
  console.log('   or on Windows:');
  console.log('   set CACHE_RESET_TOKEN=your_token_here');
  process.exit(1);
}

async function runDailyRefresh() {
  console.log('🌅 Starting daily refresh...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/daily-refresh?token=${AUTH_TOKEN}`, {
      timeout: 1800000 // 30 minutes timeout
    });
    console.log('✅ Daily refresh completed:', response.data.message);
    console.log('📊 Results:', response.data.results);
    
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('❌ Authentication failed. Check your CACHE_RESET_TOKEN environment variable.');
    } else {
      console.error('❌ Failed to run daily refresh:', error.response?.data || error.message);
    }
    return false;
  }
}

// Run the script
runDailyRefresh().catch(console.error); 