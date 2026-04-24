import { MenuItem } from '@/types';

// Voice command parser with quantity extraction
export const parseVoiceCommand = (
  transcript: string,
  menuItems: MenuItem[]
): { items: { item: MenuItem; quantity: number }[]; confidence: number } => {
  const lowerTranscript = transcript.toLowerCase();
  const foundItems: { item: MenuItem; quantity: number }[] = [];

  // Extract number patterns (e.g., "2 coffees", "one burger")
  const numberWords: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  };

  // Split transcript into tokens
  const tokens = lowerTranscript.split(/\s+/);

  // Match menu items
  menuItems.forEach((item) => {
    const itemName = item.name.toLowerCase();
    const keywords = itemName.split(' ');

    // Check if any keyword matches in transcript
    const matches = keywords.filter((keyword) => lowerTranscript.includes(keyword));

    if (matches.length > 0) {
      // Try to find quantity before the item name
      let quantity = 1;

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        // Check if current token matches item keyword
        if (keywords.some((k) => token.includes(k))) {
          // Check previous token for quantity
          if (i > 0) {
            const prevToken = tokens[i - 1];
            // Number word
            if (numberWords[prevToken]) {
              quantity = numberWords[prevToken];
            }
            // Digit
            else if (!isNaN(parseInt(prevToken))) {
              quantity = parseInt(prevToken);
            }
          }
          break;
        }
      }

      foundItems.push({ item, quantity });
    }
  });

  // Calculate confidence based on matches
  const confidence = foundItems.length > 0 ? Math.min(foundItems.length * 0.35 + 0.4, 1) : 0;

  return { items: foundItems, confidence };
};

export const getMoodBasedSuggestions = (
  mood: 'happy' | 'sad' | 'energetic' | 'relaxed',
  menuItems: MenuItem[]
): MenuItem[] => {
  const moodMap: Record<string, string[]> = {
    happy: ['Dessert', 'Pizza'],
    sad: ['Coffee', 'Dessert'],
    energetic: ['Coffee', 'Snacks', 'Burger'],
    relaxed: ['Coffee', 'Drinks'],
  };

  const categories = moodMap[mood] || [];
  return menuItems.filter((item) => categories.includes(item.category)).slice(0, 5);
};

export const getTimeBasedSuggestions = (menuItems: MenuItem[]): MenuItem[] => {
  const hour = new Date().getHours();

  let categories: string[] = [];

  if (hour >= 6 && hour < 11) {
    categories = ['Coffee', 'Snacks']; // Breakfast
  } else if (hour >= 11 && hour < 15) {
    categories = ['Burger', 'Pizza', 'Drinks']; // Lunch
  } else if (hour >= 15 && hour < 18) {
    categories = ['Coffee', 'Snacks', 'Dessert']; // Evening snacks
  } else {
    categories = ['Burger', 'Pizza', 'Dessert']; // Dinner
  }

  return menuItems.filter((item) => categories.includes(item.category)).slice(0, 6);
};

// Simulate speech recognition (mock implementation)
export const startVoiceRecognition = async (): Promise<{
  transcript: string;
  success: boolean;
}> => {
  // In production, use expo-speech-recognition or Web Speech API
  // For now, return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate random voice commands for testing
      const sampleCommands = [
        'Order 2 coffees and 1 burger',
        'I want one pizza and two drinks',
        'Get me 3 french fries',
        'Order one latte coffee',
        'I need 2 burgers and one chocolate brownie',
      ];
      const randomCommand =
        sampleCommands[Math.floor(Math.random() * sampleCommands.length)];
      resolve({ transcript: randomCommand, success: true });
    }, 2000);
  });
};

// Format voice feedback message
export const formatVoiceConfirmation = (
  items: { item: MenuItem; quantity: number }[]
): string => {
  if (items.length === 0) {
    return "I couldn't understand that. Please try again.";
  }

  const itemStrings = items.map((i) => `${i.quantity} ${i.item.name}`);

  if (items.length === 1) {
    return `Adding ${itemStrings[0]} to your cart.`;
  } else if (items.length === 2) {
    return `Adding ${itemStrings[0]} and ${itemStrings[1]} to your cart.`;
  } else {
    const lastItem = itemStrings.pop();
    return `Adding ${itemStrings.join(', ')}, and ${lastItem} to your cart.`;
  }
};
