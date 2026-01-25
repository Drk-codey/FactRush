export const BOT_PROFILES = [
  { id: 'bot_1', username: 'FactChecker_9000', avatar: '🤖', style: 'Precise' },
  { id: 'bot_2', username: 'TruthSeeker', avatar: '🦊', style: 'Aggressive' },
  { id: 'bot_3', username: 'DebunkK1ng', avatar: '🦅', style: 'Skeptical' },
  { id: 'bot_4', username: 'WikiWarrior', avatar: '📚', style: 'Academic' },
  { id: 'bot_5', username: 'SimplyCorrect', avatar: '💎', style: 'Casual' },
];

export const BOT_CLAIMS = {
  'Tech News': {
    Easy: [
      "Apple released the first iPhone in 2007.",
      "Microsoft owns GitHub.",
      "Bitcoin was created by Satoshi Nakamoto."
    ],
    Medium: [
      "The first computer bug was an actual moth found in the Harvard Mark II.",
      "Python was named after the comedy group Monty Python, not the snake.",
      "NFTs use blockchain technology to certify unique ownership of digital assets."
    ],
    Hard: [
      "The P versus NP problem is one of the seven Millennium Prize Problems.",
      "Quantum computers use qubits which can exist in multiple states simultaneously due to superposition.",
      "DeepBlue defeated Garry Kasparov in 1997 using alpha-beta pruning algorithms."
    ]
  },
  'Science': {
    Easy: [
      "Water boils at 100 degrees Celsius at sea level.",
      "The Earth revolves around the Sun.",
      "DNA stands for Deoxyribonucleic acid."
    ],
    Medium: [
      "Light travels faster than sound, which is why we see lightning before thunder.",
      "Neutron stars are so dense that a teaspoon would weigh 6 billion tons.",
      "Bananas are radioactive due to their potassium content."
    ],
    Hard: [
      "The Heisenberg Uncertainty Principle states you cannot know both position and momentum precisely.",
      "Mitochondrial Eve is the most recent common ancestor of all living humans in unbroken female line.",
      "Dark energy accounts for approximately 68% of the total energy in the observable universe."
    ]
  },
  'History': {
    Easy: [
      "The Titanic sank in 1912.",
      "World War II ended in 1945.",
      "Neil Armstrong was the first man on the moon."
    ],
    Medium: [
      "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.",
      "The shortest war in history lasted 38 minutes between Britain and Zanzibar.",
      "Oxford University is older than the Aztec Empire."
    ],
    Hard: [
      "The Great Fire of London in 1666 ended the Great Plague outbreak.",
      "Ada Lovelace is considered the first computer programmer for her work on the Analytical Engine.",
      "The Treaty of Westphalia in 1648 established the concept of state sovereignty."
    ]
  }
};

export const getRandomBotClaim = (category, difficulty) => {
  const catClaims = BOT_CLAIMS[category] || BOT_CLAIMS['Tech News']; // Fallback
  const diffClaims = catClaims[difficulty] || catClaims['Medium'];
  return diffClaims[Math.floor(Math.random() * diffClaims.length)];
};
