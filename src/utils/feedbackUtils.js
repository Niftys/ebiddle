// Round to nearest dollar helper
const roundToDollar = (value) => Math.round(value);

// Calculate proximity based on smooth percentage gradient (0% to 100% error)
export const getProximity = (guess, actual, stdDev) => {
  const roundedGuess = roundToDollar(guess);
  const roundedActual = roundToDollar(actual);
  
  if (roundedGuess === roundedActual) return 1;
  if (roundedActual === 0) return 0; // Avoid division by zero
  
  // Calculate percentage error
  const percentageError = Math.abs(roundedGuess - roundedActual) / roundedActual;
  
  // Create smooth gradient from 0% to 100% error
  // 0% error = 1.0 proximity (perfect)
  // 10% error = 0.9 proximity (very good)
  // 25% error = 0.75 proximity (good)
  // 50% error = 0.5 proximity (okay)
  // 75% error = 0.25 proximity (poor)
  // 100% error = 0.0 proximity (terrible)
  // 200%+ error = 0.0 proximity (capped)
  
  const maxPercentageError = 2.0; // Cap at 200% error
  const clampedError = Math.min(percentageError, maxPercentageError);
  
  // Use a smooth curve: proximity = 1 - (error / maxError)
  // This creates a linear gradient from 0% to 100% error
  const proximity = 1 - (clampedError / maxPercentageError);
  
  return Math.max(0, proximity); // Ensure proximity is never negative
};

// Get color based on proximity
export const getFeedbackColor = (proximity) => {
  const hue = proximity * 120;
  return `hsl(${hue}, 100%, 45%)`;
};

// More aggressive points deduction with minimum of 10 points
export const calculateDeduction = (proximity) => {
  // Base deduction + penalty multiplier
  const baseDeduction = 150; // Increased from 100
  const penaltyMultiplier = 1.5; // Penalizes wrong guesses more
  
  // Calculate deduction but enforce minimum of 10 points
  const calculatedDeduction = Math.ceil(baseDeduction * (1 - proximity) * penaltyMultiplier);
  return Math.max(10, calculatedDeduction); // Minimum deduction is 10 points
};

// Get feedback text based on guess position with dollar rounding
export const getFeedbackText = (guess, actual) => {
  return roundToDollar(guess) < roundToDollar(actual) ? "Higher" : "Lower";
};

// Export dollar rounding function
export { roundToDollar };