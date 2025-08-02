const axios = require('axios');

// Configuration
const EBAY_APP_ID = process.env.EBAY_APP_ID;
const EBAY_CERT_ID = process.env.EBAY_CERT_ID;

console.log('🔍 eBay Authentication Debug Script');
console.log('====================================');
console.log('');

// Check environment variables
console.log('📋 Environment Variables Check:');
console.log(`   EBAY_APP_ID: ${EBAY_APP_ID ? '✅ Set' : '❌ Not set'}`);
console.log(`   EBAY_CERT_ID: ${EBAY_CERT_ID ? '✅ Set' : '❌ Not set'}`);

if (!EBAY_APP_ID || !EBAY_CERT_ID) {
  console.log('');
  console.log('❌ ERROR: Missing required environment variables!');
  console.log('   Please set EBAY_APP_ID and EBAY_CERT_ID in your Firebase Functions environment.');
  console.log('');
  console.log('   To set environment variables, run:');
  console.log('   firebase functions:config:set ebay.app_id="YOUR_APP_ID"');
  console.log('   firebase functions:config:set ebay.cert_id="YOUR_CERT_ID"');
  console.log('');
  console.log('   Then redeploy your functions:');
  console.log('   firebase deploy --only functions');
  process.exit(1);
}

console.log('');
console.log('🔑 Testing eBay Token Request...');

async function testEbayToken() {
  try {
    console.log('   Making request to: https://api.ebay.com/identity/v1/oauth2/token');
    console.log(`   Using App ID: ${EBAY_APP_ID.substring(0, 8)}...`);
    console.log(`   Using Cert ID: ${EBAY_CERT_ID.substring(0, 8)}...`);
    
    const response = await axios.post(
      "https://api.ebay.com/identity/v1/oauth2/token",
      "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${Buffer.from(`${EBAY_APP_ID}:${EBAY_CERT_ID}`).toString("base64")}`
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    console.log('');
    console.log('✅ SUCCESS: eBay token request successful!');
    console.log(`   Token Type: ${response.data.token_type}`);
    console.log(`   Expires In: ${response.data.expires_in} seconds`);
    console.log(`   Access Token: ${response.data.access_token.substring(0, 20)}...`);
    
    return true;
    
  } catch (error) {
    console.log('');
    console.log('❌ ERROR: eBay token request failed!');
    console.log(`   Status: ${error.response?.status || 'No response'}`);
    console.log(`   Status Text: ${error.response?.statusText || 'Unknown'}`);
    
    if (error.response?.data) {
      console.log('   Error Details:');
      console.log(`     Error: ${error.response.data.error || 'Unknown'}`);
      console.log(`     Description: ${error.response.data.error_description || 'No description'}`);
    }
    
    if (error.code === 'ECONNABORTED') {
      console.log('   Timeout: Request took too long (>10 seconds)');
    }
    
    if (error.code === 'ENOTFOUND') {
      console.log('   Network: Could not resolve eBay API hostname');
    }
    
    console.log('');
    console.log('🔧 Troubleshooting Steps:');
    console.log('   1. Verify your eBay App ID and Cert ID are correct');
    console.log('   2. Check if your eBay application is still active');
    console.log('   3. Ensure your eBay app has the correct scopes enabled');
    console.log('   4. Verify your eBay app is configured for the correct environment (sandbox/production)');
    console.log('   5. Check if your eBay app credentials have expired');
    
    return false;
  }
}

// Run the test
testEbayToken().then(success => {
  if (success) {
    console.log('');
    console.log('🎉 Authentication is working correctly!');
    console.log('   The issue might be in your deployed Firebase Functions environment.');
    console.log('   Make sure to set the environment variables in Firebase:');
    console.log('   firebase functions:config:set ebay.app_id="YOUR_APP_ID"');
    console.log('   firebase functions:config:set ebay.cert_id="YOUR_CERT_ID"');
  } else {
    console.log('');
    console.log('💡 Next Steps:');
    console.log('   1. Check your eBay Developer Console');
    console.log('   2. Regenerate your application credentials if needed');
    console.log('   3. Update your environment variables');
    console.log('   4. Redeploy your Firebase Functions');
  }
}).catch(error => {
  console.error('Unexpected error:', error);
}); 