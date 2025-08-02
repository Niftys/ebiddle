import { useState, useEffect } from 'react';

export const useGameState = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [priceStats, setPriceStats] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);

  const [roundScore, setRoundScore] = useState(1000);
  const [gameStatus, setGameStatus] = useState('playing');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Multi-round state
  const [currentRound, setCurrentRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [roundScores, setRoundScores] = useState([]);
  const [numBids, setNumBids] = useState(0);
  const [username, setUsername] = useState(generateRandomUsername());
  const [usedItems, setUsedItems] = useState([]);

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

  const selectRandomItem = (items) => {
    const availableItems = items.filter(item => !usedItems.includes(item.id));
    if (availableItems.length === 0) {
      setUsedItems([]);
      selectRandomItem(items);
      return;
    }
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    setCurrentItem(availableItems[randomIndex]);

    setRoundScore(1000);
    setGameStatus('playing');
    setFeedback(null);
    setNumBids(0);
    setUsername(generateRandomUsername());
    setUsedItems(prev => [...prev, availableItems[randomIndex].id]);
  };

  const restartGame = () => {
    setCurrentRound(1);
    setTotalScore(0);
    setRoundScores([]);
    setUsedItems([]);
    setSelectedCategory(null);
    setItems([]);
    setCurrentItem(null);
    setPriceStats(null);
    setShowCategoryPicker(true);
  };

  const startNextRound = () => {
    if (currentRound < 10) {
      setCurrentRound(currentRound + 1);
      selectRandomItem(items);
    } else {
      setGameStatus('gameCompleted');
    }
  };

  return {
    // State
    showIntro,
    setShowIntro,
    showCategoryPicker,
    setShowCategoryPicker,
    selectedCategory,
    setSelectedCategory,
    items,
    setItems,
    priceStats,
    setPriceStats,
    currentItem,
    setCurrentItem,

    roundScore,
    setRoundScore,
    gameStatus,
    setGameStatus,
    feedback,
    setFeedback,
    loading,
    setLoading,
    currentRound,
    setCurrentRound,
    totalScore,
    setTotalScore,
    roundScores,
    setRoundScores,
    numBids,
    setNumBids,
    username,
    usedItems,
    
    // Actions
    selectRandomItem,
    restartGame,
    startNextRound,
    generateRandomUsername
  };
}; 