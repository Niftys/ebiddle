// Utility functions for handling images

/**
 * Validates and cleans an image array
 * @param {Array} images - Array of image URLs
 * @returns {Array} Cleaned array of valid image URLs
 */
export const validateImages = (images) => {
  if (!Array.isArray(images)) {
    return [];
  }
  
  return images.filter(img => 
    img && 
    typeof img === 'string' && 
    img.trim().length > 0 &&
    (img.startsWith('http') || img.startsWith('data:'))
  );
};

/**
 * Ensures we have at least one valid image
 * @param {Array} images - Array of image URLs
 * @param {string} fallbackImage - Fallback image URL
 * @returns {Array} Array with at least one valid image
 */
export const ensureValidImages = (images, fallbackImage = null) => {
  const validImages = validateImages(images);
  
  if (validImages.length === 0 && fallbackImage) {
    return [fallbackImage];
  }
  
  return validImages;
};

/**
 * Creates a unique key for image arrays
 * @param {Array} images - Array of image URLs
 * @returns {string} Unique key
 */
export const createImageKey = (images) => {
  if (!Array.isArray(images) || images.length === 0) {
    return 'no-images';
  }
  
  // Create a hash from the first few characters of each image URL
  const hash = images
    .slice(0, 3) // Only use first 3 images for performance
    .map(img => img.substring(0, 20))
    .join('-');
  
  return hash.replace(/[^a-zA-Z0-9-]/g, '');
}; 