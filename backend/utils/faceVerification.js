// Face verification utility using cosine similarity
// Compare two face descriptors (128-dimensional arrays from face-api.js)

/**
 * Calculate Euclidean distance between two face descriptors
 * @param {Array} descriptor1 - First face descriptor (128 numbers)
 * @param {Array} descriptor2 - Second face descriptor (128 numbers)
 * @returns {number} - Distance between descriptors (lower is more similar)
 */
const euclideanDistance = (descriptor1, descriptor2) => {
  if (!descriptor1 || !descriptor2) {
    throw new Error('Both descriptors are required');
  }

  if (descriptor1.length !== descriptor2.length) {
    throw new Error('Descriptors must have the same length');
  }

  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
  }
  
  return Math.sqrt(sum);
};

/**
 * Compare two face descriptors and return if they match
 * @param {Array} descriptor1 - First face descriptor
 * @param {Array} descriptor2 - Second face descriptor
 * @param {number} threshold - Maximum distance for a match (default: 0.6)
 * @returns {Object} - { isMatch: boolean, distance: number, confidence: number }
 */
const compareFaces = (descriptor1, descriptor2, threshold = 0.6) => {
  try {
    const distance = euclideanDistance(descriptor1, descriptor2);
    const isMatch = distance < threshold;
    
    // Convert distance to confidence percentage (inverse relationship)
    // Distance of 0 = 100% confidence, distance of 1 = 0% confidence
    const confidence = Math.max(0, Math.min(100, (1 - distance) * 100));
    
    return {
      isMatch,
      distance: parseFloat(distance.toFixed(4)),
      confidence: parseFloat(confidence.toFixed(2)),
      threshold
    };
  } catch (error) {
    throw new Error(`Face comparison failed: ${error.message}`);
  }
};

/**
 * Validate face descriptor format
 * @param {Array} descriptor - Face descriptor to validate
 * @returns {boolean} - True if valid
 */
const isValidDescriptor = (descriptor) => {
  return (
    Array.isArray(descriptor) &&
    descriptor.length === 128 &&
    descriptor.every(val => typeof val === 'number' && !isNaN(val))
  );
};

module.exports = {
  compareFaces,
  euclideanDistance,
  isValidDescriptor
};
