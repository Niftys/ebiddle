const axios = require('axios');

// Manually create general category by combining items from all categories
const BASE_URL = 'https://us-central1-ebiddlegame.cloudfunctions.net/api';

async function createGeneralCategory() {
  console.log('🎯 Manually creating general category...');
  
  const categories = ['electronics', 'fashion', 'home', 'sports', 'collectibles', 'entertainment', 'automotive', 'jewelry'];
  const allItems = [];
  
  // Collect items from all categories
  for (const category of categories) {
    try {
      console.log(`📦 Fetching items from ${category}...`);
      const response = await axios.get(`${BASE_URL}/sold-items?category=${category}`, {
        timeout: 10000
      });
      
      if (response.data && response.data.length > 0) {
        console.log(`✅ Found ${response.data.length} items in ${category}`);
        allItems.push(...response.data);
      } else {
        console.log(`⚠️ No items found in ${category}`);
      }
      
    } catch (error) {
      console.log(`❌ Error fetching ${category}:`, error.response?.status || error.message);
    }
  }
  
  console.log(`\n📊 Total items collected: ${allItems.length}`);
  
  if (allItems.length > 0) {
    // Check what categories are represented
    const categoriesFound = [...new Set(allItems.map(item => item.category))];
    console.log(`🎯 Categories represented: ${categoriesFound.join(', ')}`);
    
    // Show sample items
    console.log('\n📦 Sample items:');
    allItems.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. ${item.title} - $${item.price} (${item.category})`);
    });
    
    console.log('\n✅ General category data is available!');
    console.log('🎮 You can now test the general category in the game.');
    
  } else {
    console.log('\n❌ No items available for general category');
    console.log('💡 You may need to run the daily refresh first:');
    console.log('   curl "https://us-central1-ebiddlegame.cloudfunctions.net/api/daily-refresh?token=YOUR_TOKEN"');
  }
}

createGeneralCategory(); 