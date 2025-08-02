import { 
  getProximity, 
  getFeedbackColor, 
  calculateDeduction,
  getFeedbackText,
  roundToDollar
} from '../feedbackUtils';

describe('feedbackUtils', () => {
  describe('roundToDollar', () => {
    it('should round to nearest dollar', () => {
      expect(roundToDollar(123.45)).toBe(123);
      expect(roundToDollar(123.5)).toBe(124);
      expect(roundToDollar(123.51)).toBe(124);
      expect(roundToDollar(100)).toBe(100);
    });
  });

  describe('getProximity', () => {
    it('should return 1 for exact match', () => {
      expect(getProximity(100, 100, 50)).toBe(1);
    });

    it('should return 0 for 100% error or more', () => {
      expect(getProximity(200, 100, 50)).toBe(0); // 100% error
      expect(getProximity(300, 100, 50)).toBe(0); // 200% error
    });

    it('should return 0.5 for 50% error', () => {
      expect(getProximity(150, 100, 50)).toBe(0.5); // 50% error
    });

    it('should return 0.75 for 25% error', () => {
      expect(getProximity(125, 100, 50)).toBe(0.75); // 25% error
    });

    it('should return 0.9 for 10% error', () => {
      expect(getProximity(110, 100, 50)).toBe(0.9); // 10% error
    });

    it('should return 0.25 for 75% error', () => {
      expect(getProximity(175, 100, 50)).toBe(0.25); // 75% error
    });

    it('should handle percentage errors equally regardless of price', () => {
      // $5 item, guess $10 (100% error)
      const proximity1 = getProximity(10, 5, 50);
      // $100 item, guess $200 (100% error) 
      const proximity2 = getProximity(200, 100, 50);
      expect(proximity1).toBe(proximity2); // Both should be 0
    });

    it('should create smooth gradient for small errors', () => {
      // Test various small percentage errors
      expect(getProximity(105, 100, 50)).toBe(0.95); // 5% error
      expect(getProximity(110, 100, 50)).toBe(0.9);  // 10% error
      expect(getProximity(115, 100, 50)).toBe(0.85); // 15% error
      expect(getProximity(120, 100, 50)).toBe(0.8);  // 20% error
    });

    it('should handle very small errors gracefully', () => {
      expect(getProximity(101, 100, 50)).toBe(0.99); // 1% error
      expect(getProximity(102, 100, 50)).toBe(0.98); // 2% error
    });
  });

  describe('getFeedbackColor', () => {
    it('should return green for very close guesses', () => {
      expect(getFeedbackColor(0.9)).toBe('hsl(108, 100%, 45%)');
    });

    it('should return red for far off guesses', () => {
      expect(getFeedbackColor(0.1)).toBe('hsl(12, 100%, 45%)');
    });
  });

  describe('calculateDeduction', () => {
    it('should return 0 for exact match', () => {
      expect(calculateDeduction(1)).toBe(0);
    });

    it('should return higher deductions for less accurate guesses', () => {
      const deduction1 = calculateDeduction(0.7);
      const deduction2 = calculateDeduction(0.3);
      expect(deduction1).toBeLessThan(deduction2);
    });
  });

  describe('getFeedbackText', () => {
    it('should return correct feedback for exact match', () => {
      expect(getFeedbackText(100, 100)).toBe('Higher');
    });

    it('should return appropriate feedback for close guesses', () => {
      expect(getFeedbackText(95, 100)).toBe('Higher');
    });

    it('should return appropriate feedback for far off guesses', () => {
      expect(getFeedbackText(200, 100)).toBe('Lower');
    });
  });
}); 