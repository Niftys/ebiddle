import React, { useState, useRef } from 'react';
import { roundToDollar } from '../utils/feedbackUtils';
import '../styles/GameControls.css';
import confetti from 'canvas-confetti';

const pastelColors = {
  green: '#d1fae5',
  yellow: '#fef9c3',
  red: '#fee2e2',
  blue: '#e0e7ff',
};

// Custom NumberPad for mobile
const NumberPad = ({ onInput, onDelete, onSubmit, disabled, flashClass }) => (
  <div className="number-pad">
    <div className="number-pad-row">
      {[1,2,3].map((num) => (
        <button key={num} type="button" onClick={() => onInput(num)} disabled={disabled} className={flashClass}>{num}</button>
      ))}
    </div>
    <div className="number-pad-row">
      {[4,5,6].map((num) => (
        <button key={num} type="button" onClick={() => onInput(num)} disabled={disabled} className={flashClass}>{num}</button>
      ))}
    </div>
    <div className="number-pad-row">
      {[7,8,9].map((num) => (
        <button key={num} type="button" onClick={() => onInput(num)} disabled={disabled} className={flashClass}>{num}</button>
      ))}
    </div>
    <div className="number-pad-row">
      <button type="button" onClick={onDelete} disabled={disabled} className={flashClass}>⌫</button>
      <button type="button" onClick={() => onInput(0)} disabled={disabled} className={flashClass}>0</button>
      <button type="button" onClick={onSubmit} disabled={disabled} className={flashClass}>Enter</button>
    </div>
  </div>
);

const isMobile = () => window.innerWidth <= 600;

const GameControls = ({ onGuess, gameStatus, onNextRound, feedback, currentRound, roundScore, currentItem }) => {
  const [guess, setGuess] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [shakeClass, setShakeClass] = useState('');
  const [mobile, setMobile] = useState(isMobile());
  const [flashColor, setFlashColor] = useState(null);
  const [flashClass, setFlashClass] = useState('');
  const [lastGuess, setLastGuess] = useState(null);
  const prevGameStatus = useRef(gameStatus);
  const inputRef = useRef(null);

  React.useEffect(() => {
    const handleResize = () => setMobile(isMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Confetti effect for correct guess
  React.useEffect(() => {
    if (prevGameStatus.current !== 'roundWon' && gameStatus === 'roundWon') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        scalar: 0.8
      });
    }
    prevGameStatus.current = gameStatus;
  }, [gameStatus]);

  // Shake effect for incorrect guess (intensity based on proximity)
  React.useEffect(() => {
    if (feedback && feedback.text && gameStatus === 'playing' && feedback.proximity !== undefined && feedback.proximity < 1) {
      let shake = '';
      if (feedback.proximity > 0.7) shake = 'shake-small';
      else if (feedback.proximity > 0.4) shake = 'shake-medium';
      else shake = 'shake-big';
      setShakeClass(shake);
      setShake(true);
      const timeout = setTimeout(() => {
        setShake(false);
        setShakeClass('');
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [feedback, gameStatus]);

  // Flash effect for numpad on guess
  React.useEffect(() => {
    if (feedback && gameStatus === 'playing' && feedback.proximity !== undefined) {
      let cls = '';
      if (feedback.proximity > 0.7) cls = 'flash-green';
      else if (feedback.proximity > 0.4) cls = 'flash-yellow';
      else cls = 'flash-red';
      setFlashClass(cls);
      const timeout = setTimeout(() => setFlashClass(''), 350);
      return () => clearTimeout(timeout);
    }
  }, [feedback, gameStatus]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const numGuess = parseFloat(guess);
    if (isNaN(numGuess)) {
      setError('Please enter a valid number');
      return;
    }
    if (numGuess <= 0) {
      setError('Price must be greater than 0');
      return;
    }
    setError('');
    setLastGuess(numGuess);
    onGuess(numGuess);
    setGuess('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // NumberPad handlers
  const handlePadInput = (num) => {
    setGuess(g => (g.length < 8 ? g + num : g));
  };
  const handlePadDelete = () => {
    setGuess(g => g.slice(0, -1));
  };
  const handlePadSubmit = () => {
    handleSubmit();
  };

  return (
    <div className="game-controls">
      {gameStatus === 'playing' ? (
        <div className="playing-state">
          {/* Only show guess-instruction on desktop */}
          {!mobile && (
            <div className="guess-instruction">
              <p>Enter your guess.</p>
              <p>Prices are rounded to the nearest dollar.</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={`input-group${shake ? ' ' + shakeClass : ''}`}>
              <span className="currency">$</span>
              <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                pattern="[0-9]*"
                step="0.01"
                min="0.01"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Enter price guess"
                className={error ? 'error-input' : ''}
                readOnly={mobile}
              />
              <button type="submit">Bid!</button>
            </div>
            {error && <div className="error">{error}</div>}
            {/* Only show rounded preview on desktop */}
            {!mobile && guess && !error && (
              <div className="rounded-preview">
                Your guess will be rounded to: ${roundToDollar(parseFloat(guess) || 0)}
              </div>
            )}
          </form>

          {/* NumberPad only on mobile */}
          {mobile && (
            <>
              <NumberPad
                onInput={handlePadInput}
                onDelete={handlePadDelete}
                onSubmit={handlePadSubmit}
                disabled={gameStatus !== 'playing'}
                flashClass={flashClass}
              />
              {/* Feedback below number pad on mobile */}
              {feedback && (
                <div className="feedback mobile-feedback">
                  <div className="feedback-text" style={{ color: feedback.color }}>
                    {feedback.text}!{lastGuess !== null && ` You guessed $${parseFloat(lastGuess).toFixed(0)}`}
                  </div>
                  {typeof feedback.proximity === 'number' && !isNaN(feedback.proximity) && (
                    <div className="proximity-indicator">
                      <div
                        className="proximity-bar"
                        style={{
                          width: `${feedback.proximity * 100}%`,
                          backgroundColor: feedback.color
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Feedback below input on desktop */}
          {!mobile && feedback && (
            <div className="feedback">
              <div className="feedback-text" style={{ color: feedback.color }}>
                {feedback.text}!{lastGuess !== null && ` You guessed $${parseFloat(lastGuess).toFixed(2)}`}
              </div>
              {typeof feedback.proximity === 'number' && !isNaN(feedback.proximity) && (
                <div className="proximity-indicator">
                  <div
                    className="proximity-bar"
                    style={{
                      width: `${feedback.proximity * 100}%`,
                      backgroundColor: feedback.color
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="game-result">
          <h2>
            {gameStatus === 'roundWon'
              ? `Correct! You earned $${roundScore} for this round!`
              : gameStatus === 'roundLost'
                ? `Round Over! Better luck next round!`
                : ''}
          </h2>
          {currentRound < 10 ? (
            <button onClick={onNextRound}>Next Round →</button>
          ) : (
            <button onClick={onNextRound}>See Final Results</button>
          )}
        </div>
      )}
    </div>
  );
};

export default GameControls;