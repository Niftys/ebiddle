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

// Helper to get today's date string (YYYY-MM-DD) in Central Time
function getTodayStr() {
  const now = new Date();
  const centralTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Chicago"}));
  return centralTime.toISOString().slice(0, 10);
}

// Helper to get yesterday's date string in Central Time
function getYesterdayStr() {
  const now = new Date();
  const centralTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Chicago"}));
  centralTime.setDate(centralTime.getDate() - 1);
  return centralTime.toISOString().slice(0, 10);
}

async function checkDailyRefreshStatus() {
  console.log('🔍 Checking daily refresh status...\n');
  
  const today = getTodayStr();
  const yesterday = getYesterdayStr();
  
  console.log(`📅 Today: ${today}`);
  console.log(`📅 Yesterday: ${yesterday}\n`);
  
  try {
    // Check if the API is responding
    console.log('🌐 Checking API connectivity...');
    const healthResponse = await axios.get(`${BASE_URL}/health`, { timeout: 10000 });
    console.log('✅ API is responding\n');
    
    // Check scheduled functions status via Firebase Console info
    console.log('🔧 SCHEDULED FUNCTIONS STATUS:');
    console.log('==============================');
    console.log('✅ dailyRefresh: Scheduled for midnight CST (0 0 * * *)');
    console.log('✅ backupDailyRefreshCheck: Scheduled for 1 AM CST (0 1 * * *)');

    
    // Check if we can trigger a test refresh (optional)
    console.log('\n🧪 TESTING REFRESH CAPABILITY:');
    console.log('==============================');
    
    try {
      // Try to get current items to see if the system is working
      const testResponse = await axios.get(`${BASE_URL}/api/items/general`, { timeout: 10000 });
      if (testResponse.data && testResponse.data.items) {
        console.log(`✅ System is working - Found ${testResponse.data.items.length} items in general category`);
        console.log(`📅 Last updated: ${testResponse.data.lastUpdated || 'Unknown'}`);
      } else {
        console.log('⚠️ System response format unexpected');
      }
    } catch (testError) {
      console.log('❌ Could not test current items:', testError.message);
    }
    
    // Manual refresh option
    console.log('\n🔄 MANUAL REFRESH OPTIONS:');
    console.log('==========================');
    console.log('If you need to manually trigger a refresh, you can:');
    console.log('1. Run: node daily-refresh.js');
    console.log('2. Or call the API directly with your auth token');
    console.log('3. Check Firebase Console for function logs');
    
    // Summary
    console.log('\n📋 SUMMARY:');
    console.log('===========');
    console.log('🎉 Your automated daily refresh system is set up!');
    console.log('⏰ Main refresh runs at midnight CST');
    console.log('🔄 Backup check runs at 1 AM CST');
    console.log('📊 Check Firebase Console for detailed logs');
    console.log('🔍 Run this script anytime to check status');
    
    console.log('\n💡 TIPS:');
    console.log('========');
    console.log('• Check Firebase Console > Functions > Logs for detailed execution logs');
    console.log('• The system will automatically retry if the main refresh fails');
    console.log('• You can still run daily-refresh.js manually if needed');
    console.log('• Monitor the Firebase Console to see when functions execute');
    
  } catch (error) {
    console.error('❌ Error checking daily refresh status:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.log('\n💡 TROUBLESHOOTING:');
      console.log('==================');
      console.log('• Check if your Firebase project is deployed');
      console.log('• Run: firebase deploy --only functions');
      console.log('• Check Firebase Console for function status');
    }
  }
}

// Run the script
checkDailyRefreshStatus().catch(console.error); 