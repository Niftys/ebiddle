import React, { useState } from 'react';
import { FiAward, FiStar, FiThumbsUp, FiRepeat, FiShare2, FiTrendingUp, FiTarget, FiTrendingDown } from 'react-icons/fi';
import { trackEvent } from '../firebase';
import '../styles/GameSummary.css';

const GameSummary = ({ totalScore, roundScores, onRestart, selectedCategory }) => {
  const [copied, setCopied] = useState(false);
  
  const performanceData = () => {
    if (totalScore >= 9000) return { 
      title: "eBay Master!", 
      icon: <FiAward className="performance-icon" />,
      color: "#ffd700",
      bgColor: "#fff8dc",
      description: "Outstanding performance! You have exceptional pricing intuition."
    };
    if (totalScore >= 8000) return { 
      title: "Price Guru!", 
      icon: <FiAward className="performance-icon" />,
      color: "#c0392b",
      bgColor: "#fdf2f2",
      description: "Excellent work! Your pricing skills are impressive."
    };
    if (totalScore >= 6000) return { 
      title: "Good Eye!", 
      icon: <FiStar className="performance-icon" />,
      color: "#3665f3",
      bgColor: "#eaf6ff",
      description: "Nice job! You're developing strong price estimation skills."
    };
    if (totalScore >= 4000) return { 
      title: "Getting There!", 
      icon: <FiThumbsUp className="performance-icon" />,
      color: "#10b981",
      bgColor: "#f0fdf4",
      description: "Good effort! Keep practicing to improve your accuracy."
    };
    return { 
      title: "Keep Practicing!", 
      icon: <FiRepeat className="performance-icon" />,
      color: "#f59e0b",
      bgColor: "#fffbeb",
      description: "Every expert was once a beginner. Try again!"
    };
  };

  const performance = performanceData();
  const averageScore = Math.round(totalScore / 10);
  const bestRound = Math.max(...roundScores);
  const worstRound = Math.min(...roundScores);
  const completedRounds = roundScores.filter(score => score > 0).length;

  // Get category display name
  const getCategoryDisplayName = () => {
    const categoryNames = {
      general: 'Daily',
      electronics: 'Electronics',
      fashion: 'Fashion',
      home: 'Home & Garden',
      sports: 'Sports & Outdoors',
      toys: 'Toys & Hobbies',
      books: 'Books & Media',
      automotive: 'Automotive',
      jewelry: 'Jewelry & Watches'
    };
    return categoryNames[selectedCategory] || 'eBiddle';
  };

  const shareText = `I scored $${totalScore} on eBiddle in the ${getCategoryDisplayName()} category! https://ebiddlegame.com/`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Track share event
      trackEvent('score_shared', {
        total_score: totalScore,
        category: selectedCategory,
        performance_level: performance.title
      });
    } catch (err) {
      setCopied(false);
      alert('Failed to copy to clipboard.');
    }
  };

  return (
    <div className="game-summary-container">
      {/* Header Section */}
      <div className="summary-header">
        <div className="completion-badge">
          <FiTarget className="completion-icon" />
          <span>Bidding Over!</span>
        </div>
      </div>

      {/* Main Score Card */}
      <div className="main-score-card">
        <div className="score-display">
          <div className="score-label">Final Score</div>
          <div className="score-value">${totalScore.toLocaleString()}</div>
          <div className="score-max">out of $10,000</div>
        </div>
        
        <div className="performance-badge" style={{ 
          backgroundColor: performance.bgColor,
          border: `2px solid ${performance.color}20`
        }}>
          <div className="performance-content">
            {performance.icon}
            <div className="performance-text">
              <div className="performance-title" style={{ color: performance.color }}>
                {performance.title}
              </div>
              <div className="performance-description">
                {performance.description}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <div className="stat-value">${averageScore}</div>
            <div className="stat-label">Average Score</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FiAward />
          </div>
          <div className="stat-content">
            <div className="stat-value">${bestRound}</div>
            <div className="stat-label">Best Round</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FiTrendingDown />
          </div>
          <div className="stat-content">
            <div className="stat-value">${worstRound}</div>
            <div className="stat-label">Worst Round</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FiTarget />
          </div>
          <div className="stat-content">
            <div className="stat-value">{completedRounds}/10</div>
            <div className="stat-label">Rounds Won</div>
          </div>
        </div>
      </div>

      {/* Round Breakdown */}
      <div className="round-breakdown-section">
        <h3 className="breakdown-title">Round-by-Round Performance</h3>
        <div className="rounds-grid">
          {[0, 1].map(row => (
            <React.Fragment key={row}>
              {roundScores.slice(row * 5, row * 5 + 5).map((score, index) => {
                const realIndex = row * 5 + index;
                return (
                  <div
                    key={realIndex}
                    className={`round-card ${score === bestRound ? 'best-round' : ''} ${score === worstRound && score < bestRound ? 'worst-round' : ''} ${score === 0 ? 'failed-round' : ''}`}
                  >
                    <div className="round-number">R{realIndex + 1}</div>
                    <div className="round-score">${score}</div>
                    {score === bestRound && score > 0 && (
                      <div className="round-badge">★</div>
                    )}
                    {score === worstRound && score < bestRound && score > 0 && (
                      <div className="round-badge worst">⚠</div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="share-button" onClick={handleShare}>
          <FiShare2 className="button-icon" />
          {copied ? 'Copied!' : 'Share Result'}
        </button>
        <button className="restart-button" onClick={onRestart}>
          <FiRepeat className="button-icon" />
          Play Again
        </button>
      </div>

      {/* Footer Message */}
      <div className="summary-footer">
        <p>Thanks for playing eBiddle! Challenge your friends to beat your score.</p>
      </div>
    </div>
  );
};

export default GameSummary;