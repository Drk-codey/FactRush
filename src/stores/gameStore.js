import { create } from 'zustand';

export const useGameStore = create((set) => ({
  user: null, // Current user
  room: null, // Game room data
  players: [], // List of players in room
  claims: [], // All claims
  disputes: [], // All disputes
  timeLeft: 0,
  phase: 'LOBBY',
  globalLeaderboard: [], // Format: [{ player_id, username, avatar, total_score, games_played, last_updated }]

  setUser: (user) => set({ user }),
  setRoom: (room) => set((state) => ({
    room: { ...state.room, ...room },
    phase: room?.status || state.phase
  })), // Merge updates
  updateSettings: (settings) => set((state) => ({
    room: { ...state.room, ...settings }
  })),
  setPlayers: (players) => set({ players }),
  addPlayer: (player) => set((state) => ({ players: [...state.players, player] })),
  updatePlayerScore: (playerId, points) => set((state) => ({
    players: state.players.map(p =>
      p.id === playerId ? { ...p, score: (p.score || 0) + points } : p
    )
  })),
  saveGameResult: () => set((state) => {
    // Update global leaderboard with current game results
    const updatedLeaderboard = [...state.globalLeaderboard];

    state.players.forEach(player => {
      const existingIdx = updatedLeaderboard.findIndex(p => p.player_id === player.id);
      const playerScore = player.score || 0;

      if (existingIdx >= 0) {
        // Update existing player
        updatedLeaderboard[existingIdx] = {
          ...updatedLeaderboard[existingIdx],
          total_score: updatedLeaderboard[existingIdx].total_score + playerScore,
          games_played: updatedLeaderboard[existingIdx].games_played + 1,
          last_updated: new Date().toISOString()
        };
      } else {
        // Add new player
        updatedLeaderboard.push({
          player_id: player.id,
          username: player.username,
          avatar: player.avatar,
          total_score: playerScore,
          games_played: 1,
          last_updated: new Date().toISOString()
        });
      }
    });

    // Sort by total_score descending
    updatedLeaderboard.sort((a, b) => b.total_score - a.total_score);

    return { globalLeaderboard: updatedLeaderboard };
  }),
  setClaims: (claims) => set({ claims }),
  addClaim: (claim) => set((state) => ({ claims: [...state.claims, claim] })),
  updateClaim: (updatedClaim) => set((state) => ({
    claims: state.claims.map((c) => (c.id === updatedClaim.id ? updatedClaim : c))
  })),
  setDisputes: (disputes) => set({ disputes }),
  addDispute: (dispute) => set((state) => ({ disputes: [...state.disputes, dispute] })),
  setTimeLeft: (time) => set({ timeLeft: time }),
  setPhase: (phase) => set({ phase }),

  resetGame: () => set({ room: null, players: [], claims: [], disputes: [], phase: 'LOBBY', timeLeft: 0 }),
}));
