import { useState, useCallback } from 'react';

// Common profanity words - you can expand this list
const profanityWords = [
  // English profanity
  'damn', 'hell', 'shit', 'fuck', 'bitch', 'ass', 'bastard', 'crap', 'piss',
  // Filipino profanity (common ones)
  'putang', 'puta', 'gago', 'bobo', 'tanga', 'ulol', 'leche', 'buwisit', 'yawa', 'pakshet'
];

export const useProfanityFilter = () => {
  const [hasProfanity, setHasProfanity] = useState(false);
  const [detectedWords, setDetectedWords] = useState<string[]>([]);

  const checkProfanity = useCallback((text: string): boolean => {
    if (!text) return false;
    
    const words = text.toLowerCase().split(/\s+/);
    const detected: string[] = [];
    
    words.forEach(word => {
      // Remove punctuation for checking
      const cleanWord = word.replace(/[.,!?;:"'()-]/g, '');
      
      // Check exact matches and partial matches
      profanityWords.forEach(profanity => {
        if (cleanWord.includes(profanity) || word.includes(profanity)) {
          detected.push(profanity);
        }
      });
    });
    
    const hasBadWords = detected.length > 0;
    setHasProfanity(hasBadWords);
    setDetectedWords([...new Set(detected)]); // Remove duplicates
    
    return hasBadWords;
  }, []);

  const resetFilter = useCallback(() => {
    setHasProfanity(false);
    setDetectedWords([]);
  }, []);

  return {
    checkProfanity,
    hasProfanity,
    detectedWords,
    resetFilter
  };
};