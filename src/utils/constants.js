// Game Configuration
export const GAME_CONFIG = {
  TOTAL_ROUNDS: 10,
  STARTING_SCORE: 1000,
  MAX_SCORE: 10000,
  CACHE_DURATION: 86400, // 24 hours in seconds
};

// Category Configuration
export const CATEGORIES = [
  { id: 'general', name: 'General', icon: '🎯', description: 'Random items from all categories', isGeneral: true },
  { id: 'electronics', name: 'Electronics', icon: '📱', description: 'Phones, computers, gadgets' },
  { id: 'fashion', name: 'Fashion', icon: '👕', description: 'Clothing, shoes, accessories' },
  { id: 'home', name: 'Home & Garden', icon: '🏠', description: 'Furniture, decor, tools' },
  { id: 'sports', name: 'Sports & Outdoors', icon: '⚽', description: 'Equipment, gear, fitness' },
  { id: 'toys', name: 'Toys & Hobbies', icon: '🎮', description: 'Games, collectibles, crafts' },
  { id: 'books', name: 'Books & Media', icon: '📚', description: 'Books, movies, music' },
  { id: 'automotive', name: 'Automotive', icon: '🚗', description: 'Cars, parts, accessories' },
  { id: 'jewelry', name: 'Jewelry & Watches', icon: '💎', description: 'Precious metals, timepieces' }
];

// API Configuration
export const API_CONFIG = {
  EBAY_BASE_URL: 'https://api.ebay.com',
  EBAY_BROWSE_URL: 'https://api.ebay.com/buy/browse/v1/item_summary/search',
  EBAY_ITEM_URL: 'https://api.ebay.com/buy/browse/v1/item',
  EBAY_TOKEN_URL: 'https://api.ebay.com/identity/v1/oauth2/token',
  ITEMS_PER_CATEGORY: 10,
  RATE_LIMIT_DELAY: 100, // ms between item detail calls
  CATEGORY_DELAY: 200, // ms between category calls
};

// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
  MASTER: 9000,
  GURU: 8000,
  GOOD_EYE: 6000,
  GETTING_THERE: 4000,
};

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
};

// Error Messages
export const ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to fetch items. Please try again.',
  NETWORK_ERROR: 'Network error. Check your connection.',
  API_ERROR: 'Service temporarily unavailable.',
  INVALID_GUESS: 'Please enter a valid price.',
  PRICE_TOO_LOW: 'Price must be greater than 0.',
}; 