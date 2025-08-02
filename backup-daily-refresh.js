const axios = require('axios');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const app = initializeApp();
const db = getFirestore(app);

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
  console.log('🔍 Checking daily refresh status...');
  
  try {
    const today = getTodayStr();
    const yesterday = getYesterdayStr();
    
    // Check if today's refresh log exists
    const todayLog = await db.collection('daily_refresh_logs').doc(today).get();
    
    if (todayLog.exists) {
      const logData = todayLog.data();
      if (logData.success) {
        console.log('✅ Daily refresh already completed successfully today');
        console.log(`📊 Results: ${logData.results?.length || 0} categories processed`);
        console.log(`⏱️ Duration: ${logData.duration?.toFixed(2) || 'N/A'} seconds`);
        return { status: 'success', log: logData };
      } else {
        console.log('❌ Daily refresh failed today, triggering backup...');
        return { status: 'failed', log: logData };
      }
    } else {
      console.log('⚠️ No daily refresh log found for today, triggering backup...');
      return { status: 'missing', log: null };
    }
  } catch (error) {
    console.error('❌ Error checking daily refresh status:', error);
    return { status: 'error', error: error.message };
  }
}

async function triggerBackupRefresh() {
  console.log('🚀 Triggering backup daily refresh...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/daily-refresh?token=${AUTH_TOKEN}`, {
      timeout: 1800000 // 30 minutes timeout
    });
    
    console.log('✅ Backup daily refresh completed:', response.data.message);
    console.log('📊 Results:', response.data.results);
    
    // Log the backup refresh
    const today = getTodayStr();
    await db.collection('daily_refresh_logs').doc(`${today}_backup`).set({
      timestamp: new Date(),
      results: response.data.results,
      success: true,
      trigger: 'backup_script',
      originalStatus: 'missing_or_failed'
    });
    
    return true;
  } catch (error) {
    console.error('❌ Backup daily refresh failed:', error.response?.data || error.message);
    
    // Log the backup failure
    const today = getTodayStr();
    await db.collection('daily_refresh_logs').doc(`${today}_backup`).set({
      timestamp: new Date(),
      error: error.response?.data || error.message,
      success: false,
      trigger: 'backup_script',
      originalStatus: 'missing_or_failed'
    });
    
    return false;
  }
}

async function main() {
  console.log('🔄 Starting daily refresh backup check...');
  console.log(`📅 Date: ${new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago' })}`);
  console.log(`🕐 Time: ${new Date().toLocaleTimeString('en-US', { timeZone: 'America/Chicago' })}`);
  
  const status = await checkDailyRefreshStatus();
  
  if (status.status === 'success') {
    console.log('✅ No backup needed - daily refresh already completed successfully');
    return;
  }
  
  if (status.status === 'failed' || status.status === 'missing' || status.status === 'error') {
    console.log('🚨 Backup needed - triggering manual refresh...');
    const success = await triggerBackupRefresh();
    
    if (success) {
      console.log('🎉 Backup refresh completed successfully!');
    } else {
      console.log('💥 Backup refresh failed - manual intervention may be needed');
    }
  }
}

// Run the script
main().catch(console.error); 