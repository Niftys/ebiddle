// Mock data generator with dollar rounding and USD only
export const generateMockData = () => {
    const items = [];
    const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Toys'];
    
    for (let i = 0; i < 1000; i++) {
      // Generate random price and round to nearest dollar
      const rawPrice = Math.random() * 1000 + 1;
      const price = Math.round(rawPrice);
      
      items.push({
        id: `mock${i}`,
        title: `Mock Item ${i+1} (${categories[i % categories.length]})`,
        images: [
          `https://picsum.photos/300/300?random=${i}`,
          `https://picsum.photos/300/300?random=${i+1000}`,
          `https://picsum.photos/300/300?random=${i+2000}`,
          `https://picsum.photos/300/300?random=${i+3000}`,
          `https://picsum.photos/300/300?random=${i+4000}`,
          `https://picsum.photos/300/300?random=${i+5000}`,
        ],
        price: price,
      });
    }
    
    // Calculate price statistics with dollar values
    const prices = items.map(item => item.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      items: items,
      stats: {
        min,
        max,
        mean,
        stdDev
      }
    };
  };
  
  // Generate mock data
  export const mockData = generateMockData();