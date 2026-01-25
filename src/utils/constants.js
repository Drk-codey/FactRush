export const GAME_PHASES = {
  LOBBY: 'LOBBY',
  SUBMISSION: 'SUBMISSION',
  VERIFICATION: 'VERIFICATION',
  DISPUTE: 'DISPUTE',
  LEADERBOARD: 'LEADERBOARD',
};

export const PHASE_DURATIONS = {
  LOBBY: 120, // 2 mins
  SUBMISSION: 240, // 4 mins (240s)
  VERIFICATION: 120, // 2 mins
  DISPUTE: 180, // 3 mins
  LEADERBOARD: 60, // 1 min
};

export const CATEGORIES = [
  'Tech News', 'Sports', 'History', 'Science', 'Pop Culture', 'Crypto/Web3'
];

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export const CLAIM_TYPES = {
  QUICK_FACT: 'Quick Fact',
  COMPARATIVE: 'Comparative',
  TREND: 'Trend',
  PREDICTIVE: 'Predictive',
};

export const BASE_SCORES = {
  [CLAIM_TYPES.QUICK_FACT]: 10,
  [CLAIM_TYPES.COMPARATIVE]: 20,
  [CLAIM_TYPES.TREND]: 25,
  [CLAIM_TYPES.PREDICTIVE]: 30,
};
