/**
 * Utilities for generating game puzzles
 */

// Letter frequency distributions for different languages
const letterFrequencies = {
  en: {
    'A': 8.2, 'B': 1.5, 'C': 2.8, 'D': 4.3, 'E': 12.7, 'F': 2.2, 'G': 2.0, 'H': 6.1,
    'I': 7.0, 'J': 0.2, 'K': 0.8, 'L': 4.0, 'M': 2.4, 'N': 6.7, 'O': 7.5, 'P': 1.9,
    'Q': 0.1, 'R': 6.0, 'S': 6.3, 'T': 9.1, 'U': 2.8, 'V': 1.0, 'W': 2.4, 'X': 0.2,
    'Y': 2.0, 'Z': 0.1
  },
  es: {
    'A': 11.5, 'B': 2.2, 'C': 4.0, 'D': 5.0, 'E': 12.2, 'F': 0.7, 'G': 1.0, 'H': 0.7,
    'I': 6.2, 'J': 0.5, 'K': 0.1, 'L': 5.0, 'M': 3.2, 'N': 7.0, 'O': 8.7, 'P': 2.5,
    'Q': 0.9, 'R': 6.5, 'S': 7.3, 'T': 4.6, 'U': 3.9, 'V': 1.0, 'W': 0.1, 'X': 0.2,
    'Y': 1.0, 'Z': 0.5, 'Ñ': 0.2
  },
  fr: {
    'A': 7.6, 'B': 0.9, 'C': 3.0, 'D': 3.7, 'E': 14.7, 'F': 1.0, 'G': 0.9, 'H': 0.7,
    'I': 7.5, 'J': 0.6, 'K': 0.1, 'L': 5.5, 'M': 2.9, 'N': 7.1, 'O': 5.3, 'P': 3.0,
    'Q': 1.4, 'R': 6.5, 'S': 7.9, 'T': 7.2, 'U': 6.3, 'V': 1.8, 'W': 0.1, 'X': 0.4,
    'Y': 0.3, 'Z': 0.1, 'É': 1.9, 'È': 0.3, 'Ê': 0.2, 'Ç': 0.1
  }
};

// Vowels by language
const vowels = {
  en: ['A', 'E', 'I', 'O', 'U', 'Y'],
  es: ['A', 'E', 'I', 'O', 'U'],
  fr: ['A', 'E', 'I', 'O', 'U', 'Y', 'É', 'È', 'Ê']
};

/**
 * Generate a random letter based on language frequency
 * @param {string} language - Language code (en, es, fr)
 * @param {boolean} ensureVowel - Whether to ensure the result is a vowel
 * @returns {string} A single letter
 */
function getRandomLetter(language = 'en', ensureVowel = false) {
  const freq = letterFrequencies[language] || letterFrequencies.en;
  
  // If we need to ensure a vowel
  if (ensureVowel) {
    const langVowels = vowels[language] || vowels.en;
    const vowelFreq = {};
    let totalFreq = 0;
    
    // Extract just vowel frequencies
    for (const vowel of langVowels) {
      if (freq[vowel]) {
        vowelFreq[vowel] = freq[vowel];
        totalFreq += freq[vowel];
      }
    }
    
    // Normalize frequencies to sum to 1
    for (const vowel in vowelFreq) {
      vowelFreq[vowel] /= totalFreq;
    }
    
    // Select random vowel based on frequency
    let random = Math.random();
    let cumulativeProb = 0;
    
    for (const letter in vowelFreq) {
      cumulativeProb += vowelFreq[letter];
      if (random <= cumulativeProb) {
        return letter;
      }
    }
    
    // Fallback in case of rounding errors
    return langVowels[0];
  }
  
  // Regular letter selection
  let totalFreq = 0;
  for (const letter in freq) {
    totalFreq += freq[letter];
  }
  
  let random = Math.random() * totalFreq;
  let cumulativeProb = 0;
  
  for (const letter in freq) {
    cumulativeProb += freq[letter];
    if (random <= cumulativeProb) {
      return letter;
    }
  }
  
  // Fallback
  return 'E';
}

/**
 * Generate a board with a grid of letters
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @param {object} options - Configuration options
 * @returns {Array} 2D array of letters
 */
export function generateBoard(rows = 6, cols = 6, options = {}) {
  const {
    language = 'en',
    vowelProbability = 0.35, // Probability of forcing a vowel
    specialLetterProbability = 0.15 // Probability of including a special character from another language
  } = options;
  
  const board = [];
  
  // Create the 2D grid
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      // Decide if this should be a forced vowel
      const forceVowel = Math.random() < vowelProbability;
      
      // Get a random letter from the main language
      let letter = getRandomLetter(language, forceVowel);
      
      // Decide if we should use a special letter from another language
      if (Math.random() < specialLetterProbability) {
        // Pick a different language
        const languages = Object.keys(letterFrequencies).filter(lang => lang !== language);
        if (languages.length > 0) {
          const otherLang = languages[Math.floor(Math.random() * languages.length)];
          
          // Get special letters that don't exist in the main language
          const specialLetters = Object.keys(letterFrequencies[otherLang])
            .filter(char => char.length > 1 || !letterFrequencies[language][char]);
          
          if (specialLetters.length > 0) {
            letter = specialLetters[Math.floor(Math.random() * specialLetters.length)];
          }
        }
      }
      
      row.push(letter);
    }
    board.push(row);
  }
  
  return board;
}

/**
 * Generate a daily puzzle board using a seeded random number
 * @returns {Array} 2D array of letters for the daily puzzle
 */
export function generateDailyPuzzle() {
  // Use current date as seed
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  // Seed the random number generator
  // Note: This is a simple approach. A real implementation would use a more robust seeded RNG
  Math.seedrandom = seed;
  
  return generateBoard(6, 6, {
    language: 'en',
    vowelProbability: 0.4, // Slightly higher vowel probability for daily puzzles
    specialLetterProbability: 0.2
  });
}

/**
 * Get letter point values for scoring
 * @param {string} letter - The letter to get points for
 * @param {string} language - Language code
 * @returns {number} Point value for the letter
 */
export function getLetterPoints(letter, language = 'en') {
  // Common scoring pattern (roughly inverse to frequency)
  const commonScoring = {
    'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4, 'I': 1,
    'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3, 'Q': 10, 'R': 1,
    'S': 1, 'T': 1, 'U': 1, 'V': 4, 'W': 4, 'X': 8, 'Y': 4, 'Z': 10
  };
  
  // Special characters are worth more
  if (letter.length > 1 || !commonScoring[letter]) {
    return 8; // Special characters like Ñ, É, etc.
  }
  
  return commonScoring[letter] || 2;
}

// Export default for ease of use
export default {
  generateBoard,
  generateDailyPuzzle,
  getLetterPoints
};