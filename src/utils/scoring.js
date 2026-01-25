import { BASE_SCORES } from './constants';

export const calculateClaimScore = (claimType, confidenceScore, hasSource, accuracyRate = 1) => {
  // Base Score
  let score = BASE_SCORES[claimType] || 10;

  // Confidence Multiplier (0.5x - 1.5x)
  // 50% -> 0.5x, 100% -> 1.5x. Map 50-100 range to 0.5-1.5
  // (confidence - 50) / 50 * 1.0 + 0.5
  const confidenceMult = 0.5 + ((confidenceScore - 50) / 50);

  score = score * confidenceMult;

  // Source Bonus
  if (hasSource) score *= 1.1; // +10%

  // Accuracy Multiplier input (0.8x–1.3x based on user stats)
  score *= accuracyRate;

  return Math.round(score);
};

export const calculateDisputeResult = (stake, isSuccessful) => {
  if (isSuccessful) {
    return {
      points: Math.round(stake * 1.5), // 1.5x claim points (conceptually) plus stake back? 
      // Specs: "Success -> 1.5x claim points + stake back"
      // We assume stake = claim potential points * 0.2 usually.
      // Simplified: return purely the win amount.
      win: true
    }
  } else {
    return {
      points: -stake,
      win: false
    }
  }
}
