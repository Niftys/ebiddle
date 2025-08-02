import React, { useState, useEffect } from 'react';
import ItemDisplay from './components/ItemDisplay';
import GameControls from './components/GameControls';
import GameSummary from './components/GameSummary';
import { 
  getProximity, 
  getFeedbackColor, 
  calculateDeduction,
  getFeedbackText,
  roundToDollar
} from './utils/feedbackUtils';
import { mockData } from './mockData';
import { trackEvent, trackUser, setUserProps, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import './styles/App.css';

import './styles/Header.css';
import './styles/ProductInfo.css';
import './styles/GameInfo.css';
import './styles/IntroModal.css';
import { FiBell, FiShoppingCart, FiChevronDown } from 'react-icons/fi';
import dayjs from 'dayjs';

// Helper to generate a random username
function generateRandomUsername() {
  const adjectives = [
    'cool', 'fast', 'lucky', 'happy', 'clever', 'brave', 'smart', 'witty', 'chill', 'bold', 'sly', 'keen', 'quirky', 'zen', 'jolly', 'mellow', 'fancy', 'snazzy', 'zesty', 'spiffy'
  ];
  const nouns = [
    'seller', 'trader', 'picker', 'dealer', 'merchant', 'shopper', 'bidder', 'flipper', 'collector', 'hunter', 'guru', 'pro', 'boss', 'ace', 'star', 'champ', 'hero', 'ninja', 'whiz', 'genius'
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${adj}${noun}${num}`;
}

function App() {
  // Generate unique visitor ID
  const [visitorId] = useState(() => {
    const stored = localStorage.getItem('ebiddle_visitor_id');
    if (stored) return stored;
    const newId = 'visitor_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('ebiddle_visitor_id', newId);
    return newId;
  });

  const [showIntro, setShowIntro] = useState(true);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [priceStats, setPriceStats] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);

  const [roundScore, setRoundScore] = useState(1000); // Renamed to roundScore
  const [gameStatus, setGameStatus] = useState('playing');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Multi-round state
  const [currentRound, setCurrentRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [roundScores, setRoundScores] = useState([]);
  const [numBids, setNumBids] = useState(0);
  const [username, setUsername] = useState(generateRandomUsername());
  const [usedItems, setUsedItems] = useState([]); // Track which items have been used
  const [sellerNumber, setSellerNumber] = useState(null);
  const [peopleWant, setPeopleWant] = useState(null);
  
  // Score deduction animation state
  const [scoreDeduction, setScoreDeduction] = useState(null);

  // Add state for general lockout
  const [generalLocked, setGeneralLocked] = useState(false);
  const [generalLastScore, setGeneralLastScore] = useState(null);

  // Category options - Updated to match eBay's actual category structure
  const categories = [
    { id: 'general', name: 'Daily', icon: '🎯', description: 'Random items from all categories', isGeneral: true },
    { id: 'electronics', name: 'Electronics', icon: '📱', description: 'Phones, computers, gadgets, networking' },
    { id: 'fashion', name: 'Fashion & Beauty', icon: '👕', description: 'Clothing, shoes, accessories, beauty' },
    { id: 'home', name: 'Home & Garden', icon: '🏠', description: 'Furniture, decor, tools, garden' },
    { id: 'sports', name: 'Sports & Fitness', icon: '⚽', description: 'Equipment, gear, exercise, fitness' },
    { id: 'collectibles', name: 'Collectibles & Art', icon: '🎨', description: 'Collectibles, art, antiques, memorabilia' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎮', description: 'Books, video games, movies, music' },
    { id: 'automotive', name: 'Automotive', icon: '🚗', description: 'Car parts, motorcycle parts, accessories' },
    { id: 'jewelry', name: 'Jewelry & Watches', icon: '💎', description: 'Precious metals, timepieces, luxury items' }
  ];

  // Helper function to get category display name
  const getCategoryDisplayName = () => {
    if (!selectedCategory) return 'All Categories';
    const category = categories.find(cat => cat.id === selectedCategory);
    return category ? category.name : 'All Categories';
  };

  // Helper to check if today
  function isToday(dateStr) {
    if (!dateStr) return false;
    const today = dayjs().format('YYYY-MM-DD');
    return dayjs(dateStr).format('YYYY-MM-DD') === today;
  }

  // On mount, check localStorage for general lockout
  useEffect(() => {
    const lastPlayed = localStorage.getItem('general_last_played');
    const lastScore = localStorage.getItem('general_last_score');
    if (isToday(lastPlayed)) {
      setGeneralLocked(true);
      setGeneralLastScore(lastScore ? Number(lastScore) : null);
    } else {
      setGeneralLocked(false);
      setGeneralLastScore(null);
    }
  }, []);

  // When game completes, if general, store date/score
  useEffect(() => {
    if (gameStatus === 'gameCompleted' && selectedCategory === 'general') {
      localStorage.setItem('general_last_played', dayjs().toISOString());
      localStorage.setItem('general_last_score', totalScore);
      setGeneralLocked(true);
      setGeneralLastScore(totalScore);
    }
  }, [gameStatus, selectedCategory, totalScore]);

  // Track page view and set user properties
  useEffect(() => {
    trackUser(visitorId);
    setUserProps({
      first_visit: !localStorage.getItem('ebiddle_visited'),
      user_type: 'player'
    });
    
    if (!localStorage.getItem('ebiddle_visited')) {
      localStorage.setItem('ebiddle_visited', 'true');
      trackEvent('first_visit');
    }
    
    trackEvent('page_view', {
      page_title: 'eBiddle Game',
      page_location: window.location.href
    });
  }, [visitorId]);

  useEffect(() => {
    if (!selectedCategory) return;
    
    async function loadData() {
      setLoading(true);
      setLoadingProgress(0);
      
      // Set appropriate loading message based on category
      if (selectedCategory === 'general') {
        setLoadingMessage('Loading diverse items from multiple categories...');
      } else {
        setLoadingMessage(`Loading ${getCategoryDisplayName()} items...`);
      }
      
      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setLoadingProgress(prev => {
            if (prev >= 90) return prev;
            return prev + (selectedCategory === 'general' ? 5 : 10);
          });
        }, 200);
        
        console.log("🔍 Fetching from Firestore for category:", selectedCategory);
        
        // Get today's date in Central Time to match the backend
        const now = new Date();
        // Use a more reliable method to get Central Time date
        const centralDate = new Date(now.toLocaleString("en-US", {timeZone: "America/Chicago"}));
        const today = centralDate.getFullYear() + '-' + 
                     String(centralDate.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(centralDate.getDate()).padStart(2, '0');
        
        // Read directly from Firestore using the original structure
        const docRef = doc(db, 'daily_items', today, 'categories', selectedCategory);
        const docSnap = await getDoc(docRef);
        
        let items = [];
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("📄 Raw Firestore data:", data);
          
          // Get items from the data
          if (data.items && Array.isArray(data.items)) {
            items = data.items;
          }
          
          console.log("📦 Fetched items from Firestore:", items);
          console.log("📦 Number of items:", items.length);
        } else {
          console.log("❌ No data found in Firestore for", selectedCategory, "on", today);
        }
        
        clearInterval(progressInterval);
        setLoadingProgress(100);
        
        console.log("🔍 Checking items array:", {
          isArray: Array.isArray(items),
          length: items.length,
          items: items
        });
        
        if (Array.isArray(items) && items.length > 0) {
          console.log("🎮 Setting up game with", items.length, "items");
          setItems(items);
          
          // Calculate price stats
          const prices = items.map(item => item.price);
          const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
          const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
          const stdDev = Math.sqrt(variance);
          
          const stats = { mean, stdDev };
          console.log("📊 Calculated price stats:", stats);
          setPriceStats(stats);
          
          console.log("🎯 Selecting random item...");
          selectRandomItem(items);
        } else {
          console.log("❌ No items to set up game with");
          setItems([]);
          setCurrentItem(null);
          setPriceStats(null);
        }
      } catch (err) {
        console.error("Failed to fetch eBay items", err);
        setItems([]);
        setCurrentItem(null);
        setPriceStats(null);
      }
      
      // Reset loading state after a short delay to show completion
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
        setLoadingMessage('');
      }, 500);
    }
    loadData();
  }, [selectedCategory]);

  useEffect(() => {
    if (currentItem) {
      setSellerNumber(Math.floor(Math.random() * 10000));
      setPeopleWant(Math.floor(Math.random() * 1000));
    }
  }, [currentItem]);

  const selectRandomItem = (items) => {
    const availableItems = items.filter(item => !usedItems.includes(item.id));
    if (availableItems.length === 0) {
      // If all items are used, reset used items and try again
      setUsedItems([]);
      selectRandomItem(items);
      return;
    }
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    setCurrentItem(availableItems[randomIndex]);
    setRoundScore(1000); // Reset roundScore
    setGameStatus('playing');
    setFeedback(null);
    setNumBids(0); // Reset bids for new round
    setUsername(generateRandomUsername()); // Generate new username for each item
    setUsedItems(prev => [...prev, availableItems[randomIndex].id]); // Mark item as used
  };

  const handleGuess = (guess) => {
    if (gameStatus !== 'playing' || !priceStats) return;
    setNumBids(numBids + 1); // Increment bids on each guess
    
    // Round both guess and actual to nearest dollar
    const roundedGuess = roundToDollar(guess);
    const roundedActual = roundToDollar(currentItem.price);
    
    const proximity = getProximity(guess, currentItem.price, priceStats.stdDev);
    const deduction = calculateDeduction(proximity);
    
    // Set feedback
    const newFeedback = {
      text: getFeedbackText(guess, currentItem.price),
      color: getFeedbackColor(proximity),
      proximity
    };
    
    setFeedback(newFeedback);
    
    // Check game status using rounded values
    if (roundedGuess === roundedActual) {
      // Correct guess - keep full score, no deduction
      const newRoundScores = [...roundScores, roundScore];
      setRoundScores(newRoundScores);
      
      // Add to total score
      setTotalScore(totalScore + roundScore);
      
      // Track correct guess
      trackEvent('correct_guess', {
        round: currentRound,
        score: roundScore,
        category: selectedCategory,
        num_guesses: numBids + 1
      });
      
      // Check if game is complete
      if (currentRound >= 10) {
        setGameStatus('gameCompleted');
        
        // Track game completion
        trackEvent('game_completed', {
          total_score: totalScore + roundScore,
          category: selectedCategory,
          rounds_won: newRoundScores.filter(score => score > 0).length
        });
      } else {
        setGameStatus('roundWon');
      }
    } else {
      // Incorrect guess - deduct points
      const newScore = Math.max(0, roundScore - deduction);
      
      // Trigger score deduction animation
      setScoreDeduction(deduction);
      
      // Clear the animation after 2 seconds
      setTimeout(() => {
        setScoreDeduction(null);
      }, 2000);
      
      setRoundScore(newScore);
      
      // Check if score reaches zero
      if (newScore <= 0) {
        // Add to round scores
        const newRoundScores = [...roundScores, 0];
        setRoundScores(newRoundScores);
        
        // Check if game is complete
        if (currentRound >= 10) {
          setGameStatus('gameCompleted');
          
          // Track game completion (failed)
          trackEvent('game_completed', {
            total_score: totalScore,
            category: selectedCategory,
            rounds_won: newRoundScores.filter(score => score > 0).length,
            failed: true
          });
        } else {
          setGameStatus('roundLost');
        }
      }
    }
  };

  const startNextRound = () => {
    if (currentRound < 10) {
      setCurrentRound(currentRound + 1);
      selectRandomItem(items);
    } else {
      setGameStatus('gameCompleted');
    }
  };

  const restartGame = () => {
    // Track game restart
    trackEvent('game_restart', {
      previous_category: selectedCategory,
      previous_score: totalScore
    });
    
    setCurrentRound(1);
    setTotalScore(0);
    setRoundScores([]);
    setUsedItems([]); // Reset used items
    setSelectedCategory(null);
    setItems([]);
    setCurrentItem(null);
    setPriceStats(null);
    setShowCategoryPicker(true);
  };

  // Add a debug log for currentItem
  console.log("Current item:", currentItem);

  return (
    
    <div className="app">
      {showIntro && (
      <div className="intro-modal">
        <div className="intro-content">
          <img src="/ebiddle.svg" alt="eBiddle Logo" className="intro-logo" />
          <h1>Welcome to eBiddle!</h1>
          <p>
            Guess the final price of 10 real eBay items.<br /><br />
            Be careful! Each wrong guess loses you money.<br /><br />
            <strong>Listings refresh daily!</strong>
          </p>
          <button className="intro-start-button" onClick={() => {
            setShowIntro(false);
            setShowCategoryPicker(true);
          }}>
            Start Playing
          </button>
        </div>
      </div>
    )}

      {showCategoryPicker && (
        <div className="intro-modal">
          <div className="intro-content">
            <img src="/ebiddle.svg" alt="eBiddle Logo" className="intro-logo" />
            <h1>Choose Your Category</h1>
            <p>Select a category to start guessing prices!</p>
            
            <div className="category-grid">
              {categories.map((category) => {
                const isGeneral = category.isGeneral;
                const isLocked = isGeneral && generalLocked;
                return (
                  <button
                    key={category.id}
                    className={`category-card ${isGeneral ? 'general-category' : ''} ${isLocked ? 'general-locked' : ''}`}
                    onClick={() => {
                      if (isLocked) return;
                      setSelectedCategory(category.id);
                      setShowCategoryPicker(false);
                      // Track category selection
                      trackEvent('category_selected', {
                        category_id: category.id,
                        category_name: category.name,
                        is_general: category.isGeneral || false
                      });
                    }}
                    disabled={isLocked}
                    style={isLocked ? { opacity: 0.6, cursor: 'not-allowed', position: 'relative' } : {}}
                  >
                    <div className="category-icon">{category.icon}</div>
                    <div className="category-name">{category.name}</div>
                    <div className="category-description">{category.description}</div>
                    {isGeneral && (
                      <div className="once-per-day-badge">🕒 1 play per day</div>
                    )}
                    {isLocked && (
                      <div className="general-lock-overlay">
                        <div className="lock-message">Come back tomorrow!<br/>Your score: ${generalLastScore ?? 0}</div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <button 
              className="back-button" 
              onClick={() => {
                setShowCategoryPicker(false);
                setShowIntro(true);
              }}
            >
              ← Back
            </button>
          </div>
        </div>
      )}
      {/* eBay-style Header */}
      <header className="ebay-header">
        <div className="top-nav">
          <div className="top-nav-content">
          <div className="nav-left">
            <span>Hi! Sign in or register</span>
            <span>Daily Deals</span>
            <span>Brand Outlet</span>
            <span>Gift Cards</span>
            <button 
              onClick={() => window.open('/privacy.html', '_blank', 'noopener,noreferrer')}
              style={{ 
                color: "#005ea6", 
                background: "none", 
                border: "none", 
                cursor: "pointer", 
                font: "inherit",
                padding: 0,
                textDecoration: "underline"
              }}
            >
              Privacy Policy
            </button>
          </div>
          <div className="nav-right">
            <span>Sell</span>
            <span>Watchlist<FiChevronDown /></span>
            <span>My eBiddle<FiChevronDown /></span>
            <span className="icon"><FiBell /></span>
            <span className="icon"><FiShoppingCart /></span>
          </div>
          </div>
        </div>
        
        <div className="main-header">
          <div className="logo-section">
            <img src="/ebiddle.svg" alt="eBiddle Logo" className="logo-img" />
          </div>
          <div className="search-section">
            <div className="search-area-row">
              <div className="search-bar">
                <input 
                  type="text"
                  placeholder="...the price guessing game"
                  className="search-input"
                  readOnly
                />
                <div className="search-dropdown">{getCategoryDisplayName()}</div>
              </div>
              <button className="search-button">Search</button>
              <span className="advanced-link">Advanced</span>
            </div>
          </div>
        </div>
      </header>

      {/* Game Info Bar */}
      <div className="game-info-bar">
        <div className="game-stats">
          <div className={`score ${roundScore < 500 ? 'low-score' : ''}`}>
            Round Score: ${roundScore}
            {scoreDeduction && (
              <div className="score-deduction-overlay">-${scoreDeduction}</div>
            )}
          </div>
          <div className="round-counter">
            Round: {currentRound}/10
          </div>
          <div className="total-score">
            Total Score: ${totalScore}/$10,000
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{loadingMessage}</p>
          <div className="loading-progress-bar">
            <div className="loading-progress" style={{ width: `${loadingProgress}%` }}></div>
          </div>
        </div>
      ) : selectedCategory && items.length === 0 ? (
        <p className="loading">No items found from eBay API.</p>
      ) : selectedCategory && !currentItem ? (
        <p className="loading">No current item selected.</p>
      ) : gameStatus === 'gameCompleted' ? (
        <GameSummary 
          totalScore={totalScore} 
          roundScores={roundScores}
          onRestart={restartGame}
          selectedCategory={selectedCategory}
        />
      ) : currentItem ? (
        <div className="ebay-listing-layout">
          {/* Left Side - Product Images (desktop/tablet only) */}
          <div className="product-images-section">
            <ItemDisplay 
              item={currentItem} 
              showPrice={['roundWon', 'roundLost', 'gameCompleted'].includes(gameStatus)} 
            />
          </div>
          {/* Right Side - Product Info & Bidding */}
          <div className="product-info-section">
            <div className="product-details">
              <h1 className="product-title">{currentItem.title}</h1>
              <div className="seller-info">
                <div className="seller-avatar">{username.charAt(0).toUpperCase()}</div>
                <div className="seller-details">
                  <div className="seller-name">{username} ({sellerNumber})</div>
                  <div className="seller-links">
                  <a href="#">100% Positive</a> • <a href="#">Seller's other items</a> • <a href="#">Contact seller</a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bidding/Guessing Area */}
            <div className="bidding-section">              <div className="price-info">
                <div className="current-price">
                  {['roundWon', 'roundLost', 'gameCompleted'].includes(gameStatus)
                    ? `$${currentItem.price.toFixed(2)}`
                    : '$???'}
                </div>
                <div className="bid-info">{numBids} {numBids === 1 ? 'bid' : 'bids'}</div>
                <div className="time-left">Ends NOW.</div>
                <div className="condition">Condition: Pre-owned - Fair</div>
              </div>
              
              <GameControls 
                onGuess={handleGuess}
                gameStatus={gameStatus}
                onNextRound={startNextRound}
                feedback={feedback}
                currentRound={currentRound}
                roundScore={roundScore}
                currentItem={currentItem}
              />
              
              <div className="engagement-metric">
                ⚡ <b>People want this.</b> {peopleWant} people are watching this.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="loading"></p>
      )}
      
  {/* Bottom Bar */}
    </div>
  );
}

export default App;