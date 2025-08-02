# eBay Price Guesser

A React-based game where users guess the final selling price of eBay items.

## Security Setup

⚠️ **IMPORTANT**: Before running this project, you must set up the required environment variables to avoid exposing sensitive credentials.

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# eBay API Credentials
EBAY_APP_ID=your_ebay_app_id
EBAY_CERT_ID=your_ebay_cert_id

# Cache Reset Token (for daily refresh functionality)
CACHE_RESET_TOKEN=your_secure_token_here

# Firebase Configuration (if using Firebase)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### Security Notes

- **Never commit `.env` files** to version control
- **Never commit Firebase service account keys** to version control
- **Never hardcode API keys or tokens** in your source code
- The `.gitignore` file is configured to exclude sensitive files

## Features

- **10 Rounds**: Play 10 rounds per game with fresh items each round
- **8 Categories**: Electronics, Fashion, Home & Garden, Sports & Outdoors, Toys & Hobbies, Books & Media, Automotive, Jewelry & Watches
- **General Mode**: Random items from all categories
- **Real eBay Data**: Uses actual sold eBay listings via eBay Browse API
- **Daily Refresh**: New listings every day
- **Score Tracking**: Track your performance across rounds
- **Image Gallery**: Multiple images per listing with navigation
- **Mobile Responsive**: Works on all devices

## Tech Stack

- **Frontend**: React 19, Create React App
- **Backend**: Firebase Functions (Gen 2), Express.js
- **APIs**: eBay Browse API, eBay OAuth
- **Hosting**: Firebase Hosting
- **Caching**: Node-cache for API responses
- **Styling**: CSS3 with custom eBay-inspired design

## Getting Started

### Prerequisites
- Node.js 18+ 
- Firebase CLI
- eBay Developer Account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ebay-price-guesser
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd functions && npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the functions directory:
   ```
   EBAY_APP_ID=your_ebay_app_id
   EBAY_CERT_ID=your_ebay_cert_id
   EBAY_VERIFICATION_TOKEN=your_verification_token
   ```

4. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

## How to Play

1. **Choose a Category**: Select from 8 categories or try General mode
2. **Guess Prices**: Enter your price guess for each eBay item
3. **Get Feedback**: See how close your guess was and get hints
4. **Score Points**: Earn points based on accuracy
5. **Complete 10 Rounds**: Try to get the highest total score

## API Usage

- **Regular Categories**: ~11 eBay API calls per category
- **General Category**: ~24-28 eBay API calls (spread across all categories)
- **Caching**: 24-hour cache per category
- **Rate Limiting**: Built-in delays to respect eBay API limits

## Development

### Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `firebase deploy` - Deploy to Firebase

### Project Structure

```
src/
├── components/          # React components
│   ├── GameControls.js  # Game input and controls
│   ├── GameSummary.js   # End-game summary
│   ├── ImageGallery.js  # Image carousel
│   └── ItemDisplay.js   # Item display component
├── styles/              # CSS files
├── utils/               # Utility functions
│   └── feedbackUtils.js # Scoring and feedback logic
├── App.js              # Main application component
└── firebase.js         # Firebase configuration

functions/
└── index.js            # Firebase Functions (API endpoints)
```

## Performance

- **Frontend**: Optimized React components with proper state management
- **Backend**: Efficient caching and rate limiting
- **Images**: Proxy service to avoid tracking protection
- **Mobile**: Responsive design with touch-friendly controls

## Privacy & Security

- **Privacy Policy**: Comprehensive privacy policy included
- **Data Storage**: Minimal data collection, local browser storage
- **API Security**: Secure eBay API integration with OAuth
- **HTTPS**: All communications encrypted

## Design Features

- **eBay-Inspired UI**: Authentic eBay-like interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: CSS transitions and hover effects
- **Accessibility**: Keyboard navigation and screen reader support

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

---
