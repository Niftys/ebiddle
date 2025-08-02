const {onRequest} = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {onSchedule} = require("firebase-functions/v2/scheduler");

// Initialize Firebase Admin
const app = initializeApp();
const db = getFirestore(app);

const expressApp = express();
expressApp.use(cors());
expressApp.use(express.json());

// Health check endpoint
expressApp.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "2.0",
    functions: {
      dailyRefresh: "scheduled",
    },
  });
});

// Image proxy endpoint - ESSENTIAL for displaying eBay images
expressApp.get("/api/proxy-image", async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) {
      return res.status(400).json({error: "Missing image URL"});
    }

    const response = await axios.get(imageUrl, {
      responseType: "stream",
      timeout: 10000
    });

    // Set appropriate headers for image serving
    res.setHeader("Content-Type", response.headers["content-type"]);
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Remove restrictive CSP headers that might be inherited
    res.removeHeader("Content-Security-Policy");
    res.removeHeader("X-Content-Type-Options");

    // Pipe the image data to the response
    response.data.pipe(res);
  } catch (error) {
    console.error("Error proxying image:", error);
    res.status(500).json({error: "Failed to proxy image"});
  }
});

// Main API endpoint to get items for the game
expressApp.get("/api/sold-items", async (req, res) => {
  try {
    const category = req.query.category || "electronics";

    // Get today's date
    const today = getTodayStr();

    // Special handling for general category - fetch from multiple categories
    if (category === "general") {
      console.log(`🎯 Fetching general category items from multiple categories...`);

      const categories = ["electronics", "fashion", "home", "sports", "collectibles", "entertainment", "automotive", "jewelry"];
      const allItems = [];

      // Fetch items from each category
      for (const cat of categories) {
        try {
          const docRef = db.collection("daily_items").doc(today).collection("categories").doc(cat);
          const doc = await docRef.get();

          if (doc.exists) {
            const data = doc.data();
            const items = data.items || [];
            console.log(`📦 Found ${items.length} items for ${cat}`);
            allItems.push(...items);
          } else {
            console.log(`📦 No items found for ${cat} on ${today}`);
          }
        } catch (catError) {
          console.error(`❌ Error fetching ${cat}:`, catError);
        }
      }

      console.log(`🎯 Total items collected for general category: ${allItems.length}`);

      if (allItems.length > 0) {
        // Return all stored general items (already selected during daily refresh)
        console.log(`🎯 Serving ${allItems.length} general items`);
        res.json(allItems);
      } else {
        console.log(`❌ No items found for general category on ${today}`);
        res.json([]);
      }
    } else {
      // Regular category handling
      const docRef = db.collection("daily_items").doc(today).collection("categories").doc(category);
      const doc = await docRef.get();

      if (doc.exists) {
        const data = doc.data();
        const items = data.items || [];

        console.log(`📦 Serving ${items.length} items for ${category} from Firestore`);

        // Return all stored items (no random selection)
        res.json(items);
      } else {
        console.log(`📦 No items found for ${category} on ${today}`);
        res.json([]);
      }
    }

  } catch (error) {
    console.error("Error fetching sold items:", error);
    res.status(500).json({ error: "Failed to fetch sold items", details: error.message });
  }
});

// Manual daily refresh endpoint
expressApp.get("/api/daily-refresh", async (req, res) => {
  const token = req.query.token;
  const expectedToken = process.env.CACHE_RESET_TOKEN;
  if (!expectedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (token !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const startTime = new Date();
  console.log(`🌅 Manual daily refresh triggered at ${startTime.toISOString()}`);

  try {
    const today = getTodayStr();
    const categories = ['electronics', 'fashion', 'home', 'sports', 'collectibles', 'entertainment', 'automotive', 'jewelry'];
    const results = [];

    for (const category of categories) {
      try {
        console.log(`🔄 Refreshing ${category}...`);

        // Get eBay access token
        const accessToken = await getEbayAccessToken();

        // Collect sold items for this category
        const items = await collectSoldItems(accessToken, category);

        // Store in Firestore
        await storeItemsInFirestore(category, items);

        results.push({
          category,
          itemCount: items.length
        });

        console.log(`✅ ${category}: ${items.length} items stored`);

      } catch (categoryError) {
        console.error(`❌ Error processing category ${category}:`, categoryError);
        results.push({
          category,
          error: categoryError.message,
          itemCount: 0
        });
      }
    }

    // Create general category by selecting 10 random items from all categories
    console.log(`🎯 Creating general category...`);
    try {
      const allItems = [];

      // Collect items from all categories
      for (const cat of categories) {
        try {
          const docRef = db.collection('daily_items').doc(today).collection('categories').doc(cat);
          const doc = await docRef.get();

          if (doc.exists) {
            const data = doc.data();
            const items = data.items || [];
            console.log(`📦 Adding ${items.length} items from ${cat} to general category pool`);
            allItems.push(...items);
          }
        } catch (catError) {
          console.error(`❌ Error collecting items from ${cat}:`, catError);
        }
      }

      if (allItems.length > 0) {
        // Select 10 random items from the combined pool
        const shuffled = allItems.sort(() => 0.5 - Math.random());
        const selectedItems = shuffled.slice(0, 10);
        
        // Store only the 10 selected items
        await storeItemsInFirestore('general', selectedItems);
        console.log(`✅ General category created with ${selectedItems.length} items (selected from ${allItems.length} total)`);

        results.push({
          category: 'general',
          itemCount: selectedItems.length,
          totalPoolSize: allItems.length
        });
      } else {
        console.log(`⚠️ No items available for general category`);
        results.push({
          category: 'general',
          itemCount: 0
        });
      }
    } catch (generalError) {
      console.error(`❌ Error creating general category:`, generalError);
      results.push({
        category: 'general',
        error: generalError.message,
        itemCount: 0
      });
    }

    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;

    console.log(`🎉 Daily refresh completed successfully!`);
    console.log(`⏱️ Duration: ${duration.toFixed(2)} seconds`);
    console.log(`📊 Results:`, results);

    // Log to Firestore for monitoring
    await db.collection('daily_refresh_logs').doc(today).set({
      timestamp: new Date(),
      startTime: startTime,
      endTime: endTime,
      duration: duration,
      results: results,
      success: true,
      trigger: 'manual_api_call'
    });

    res.json({
      message: 'Daily refresh completed successfully',
      results,
      duration: duration.toFixed(2)
    });

  } catch (error) {
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;

    console.error(`❌ Daily refresh failed:`, error);

    // Log error to Firestore for monitoring
    await db.collection('daily_refresh_logs').doc(today).set({
      timestamp: new Date(),
      startTime: startTime,
      endTime: endTime,
      duration: duration,
      error: error.message,
      success: false,
      trigger: 'manual_api_call'
    });

    res.status(500).json({
      error: 'Daily refresh failed',
      details: error.message,
      duration: duration.toFixed(2)
    });
  }
});



// Utility functions
function getTodayStr() {
  // Use Central Time (CST/CDT) for consistency with your timezone
  const now = new Date();
  // Use a more reliable method to get Central Time date
  const centralDate = new Date(now.toLocaleString("en-US", {timeZone: "America/Chicago"}));
  return centralDate.getFullYear() + '-' + 
         String(centralDate.getMonth() + 1).padStart(2, '0') + '-' + 
         String(centralDate.getDate()).padStart(2, '0');
}

function cleanItemsForFirestore(items) {
  return items.map(item => {
    const cleanItem = {};
    for (const [key, value] of Object.entries(item)) {
      if (value !== undefined && value !== null) {
        cleanItem[key] = value;
      }
    }
    return cleanItem;
  });
}

async function getEbayAccessToken() {
  const clientId = process.env.EBAY_APP_ID;
  const clientSecret = process.env.EBAY_CERT_ID;

  if (!clientId || !clientSecret) {
    throw new Error('eBay credentials not configured');
  }

  const response = await axios.post('https://api.ebay.com/identity/v1/oauth2/token',
    'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      }
    }
  );

  return response.data.access_token;
}

// Collect sold items for a category
async function collectSoldItems(accessToken, category) {
  const categoryIds = {
    electronics: "293",
    fashion: "11450",
    home: "11700",
    sports: "888",
    collectibles: "1",
    entertainment: "267",
    automotive: "6000",
    jewelry: "281"
  };

  const categoryId = categoryIds[category] || categoryIds.electronics;

  const response = await axios.get(
    "https://api.ebay.com/buy/browse/v1/item_summary/search",
    {
      params: {
        category_ids: categoryId,
        filter: "conditionIds:{3000},deliveryCountry:US,soldItems:true",
        sort: "-endDate",
        limit: 100,
      },
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY-US",
      },
    }
  );

  const items = [];
  const itemSummaries = response.data.itemSummaries || [];

  for (const item of itemSummaries) {
    if (item.price && item.price.value) {
      try {
        const detailResponse = await axios.get(
          `https://api.ebay.com/buy/browse/v1/item/${item.itemId}`,
          {
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "X-EBAY-C-MARKETPLACE-ID": "EBAY-US",
            },
          }
        );

        const detail = detailResponse.data;
        const images = [];

        if (detail.image && detail.image.imageUrl) {
          const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(detail.image.imageUrl)}`;
          images.push(proxyUrl);
        }

        if (detail.additionalImages) {
          for (const additionalImage of detail.additionalImages.slice(0, 4)) {
            if (additionalImage.imageUrl) {
              const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(additionalImage.imageUrl)}`;
              images.push(proxyUrl);
            }
          }
        }

        items.push({
          id: item.itemId,
          title: item.title,
          image: images[0] || null,
          images: images,
          price: Number(item.price.value),
          currency: item.price.currency,
          category: category,
          condition: detail.condition,
          itemWebUrl: detail.itemWebUrl
        });

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (detailError) {
        console.error(`Error fetching details for item ${item.itemId}:`, detailError.message);
      }
    }
  }

  return items;
}

// Store items in Firestore
async function storeItemsInFirestore(category, items) {
  const today = getTodayStr();
  const docRef = db.collection('daily_items').doc(today).collection('categories').doc(category);

  const cleanItems = cleanItemsForFirestore(items);

  await docRef.set({
    category: category,
    date: today,
    items: cleanItems,
    createdAt: new Date(),
    itemCount: cleanItems.length
  });

  console.log(`📦 Stored ${cleanItems.length} items for ${category} on ${today}`);
}

// Main API export
exports.api = onRequest({ region: "us-central1" }, expressApp);

// Daily refresh - runs at midnight CST (your main game function)
exports.dailyRefresh = onSchedule({
  schedule: "0 0 * * *", // Every day at midnight
  region: "us-central1",
  timeZone: "America/Chicago", // Central Standard Time
  timeoutSeconds: 1800, // 30 minutes timeout
  memory: "1GiB"
}, async (event) => {
  console.log("🌅 Daily refresh triggered at midnight");

  try {
    const categories = ['electronics', 'fashion', 'home', 'sports', 'collectibles', 'entertainment', 'automotive', 'jewelry'];
    const results = [];

    for (const category of categories) {
      try {
        console.log(`🔄 Refreshing ${category}...`);

        // Get eBay access token
        const accessToken = await getEbayAccessToken();

        // Collect sold items for this category
        const items = await collectSoldItems(accessToken, category);

        // Store in Firestore
        await storeItemsInFirestore(category, items);

        results.push({
          category,
          itemCount: items.length
        });

        console.log(`✅ ${category}: ${items.length} items stored`);

      } catch (categoryError) {
        console.error(`❌ Error processing category ${category}:`, categoryError);
        results.push({
          category,
          error: categoryError.message,
          itemCount: 0
        });
      }
    }

    // Create general category by combining items from all categories
    console.log(`🎯 Creating general category...`);
    try {
      const today = getTodayStr();
      const allItems = [];

      // Collect items from all categories
      for (const cat of categories) {
        try {
          const docRef = db.collection('daily_items').doc(today).collection('categories').doc(cat);
          const doc = await docRef.get();

          if (doc.exists) {
            const data = doc.data();
            const items = data.items || [];
            console.log(`📦 Adding ${items.length} items from ${cat} to general category`);
            allItems.push(...items);
          }
        } catch (catError) {
          console.error(`❌ Error collecting items from ${cat}:`, catError);
        }
      }

      if (allItems.length > 0) {
        // Store general category
        await storeItemsInFirestore('general', allItems);
        console.log(`✅ General category created with ${allItems.length} items`);

        results.push({
          category: 'general',
          itemCount: allItems.length
        });
      } else {
        console.log(`⚠️ No items available for general category`);
        results.push({
          category: 'general',
          itemCount: 0
        });
      }
    } catch (generalError) {
      console.error(`❌ Error creating general category:`, generalError);
      results.push({
        category: 'general',
        error: generalError.message,
        itemCount: 0
      });
    }

    console.log("✅ Daily refresh completed");
    return { success: true, results };
  } catch (error) {
    console.error("❌ Daily refresh failed:", error);
    throw error;
  }
});
