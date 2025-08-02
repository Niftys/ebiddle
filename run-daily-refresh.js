const axios = require('axios');

// Run daily refresh to populate all categories and create general category
const BASE_URL = 'https://us-central1-ebiddlegame.cloudfunctions.net/api';

async function runDailyRefresh() {
  console.log('🌅 Running daily refresh...');
  console.log('📅 This will populate all categories and create the general category');
  
  // Get the token from environment variable or prompt user
  const token = process.env.CACHE_RESET_TOKEN;
  
  if (!token) {
    console.log('❌ Error: CACHE_RESET_TOKEN environment variable not set');
    console.log('💡 Please set your token:');
    console.log('   export CACHE_RESET_TOKEN=your_token_here');
    console.log('   or');
    console.log('   set CACHE_RESET_TOKEN=your_token_here (Windows)');
    return;
  }
  
  try {
    console.log('\n🔄 Triggering daily refresh...');
    console.log('⏱️ This may take 5-10 minutes to complete...');
    
    const startTime = new Date();
    console.log(`🚀 Started at: ${startTime.toISOString()}`);
    
    const response = await axios.get(`${BASE_URL}/daily-refresh?token=${token}`, {
      timeout: 600000 // 10 minutes timeout
    });
    
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n✅ Daily refresh completed successfully!');
    console.log(`⏱️ Duration: ${duration.toFixed(2)} seconds`);
    console.log(`📊 Results:`);
    
    if (response.data && response.data.results) {
      response.data.results.forEach(result => {
        if (result.error) {
          console.log(`❌ ${result.category}: ${result.error}`);
        } else {
          console.log(`✅ ${result.category}: ${result.itemCount} items`);
        }
      });
    }
    
    // Check if general category was created
    console.log('\n🎯 Checking general category...');
    try {
      const generalResponse = await axios.get(`${BASE_URL}/sold-items?category=general`, {
        timeout: 10000
      });
      
      if (generalResponse.data && generalResponse.data.length > 0) {
        console.log(`✅ General category: ${generalResponse.data.length} items available`);
        
        // Show diversity
        const categories = [...new Set(generalResponse.data.map(item => item.category))];
        console.log(`🎯 Categories represented: ${categories.length}/8`);
        console.log(`📋 Categories: ${categories.join(', ')}`);
        
        // Show sample items
        console.log('\n📦 Sample general category items:');
        generalResponse.data.slice(0, 3).forEach((item, index) => {
          console.log(`${index + 1}. ${item.title} - $${item.price} (${item.category})`);
        });
        
      } else {
        console.log('⚠️ General category has no items');
      }
      
    } catch (generalError) {
      console.log('❌ Error checking general category:', generalError.response?.status || generalError.message);
    }
    
    console.log('\n🎉 Daily refresh process completed!');
    console.log('🎮 The general category should now be available in the game.');
    
  } catch (error) {
    console.log('\n❌ Daily refresh failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Authentication failed. Please check your CACHE_RESET_TOKEN.');
    } else if (error.code === 'ECONNABORTED') {
      console.log('\n⏱️ Request timed out. The refresh may still be running in the background.');
      console.log('💡 Check the Firebase Functions logs for progress.');
    }
  }
}

// Helper function to check if token is valid format
function isValidToken(token) {
  return token && token.length > 10; // Basic validation
}

// Main execution
if (require.main === module) {
  runDailyRefresh().catch(console.error);
}

module.exports = { runDailyRefresh }; 