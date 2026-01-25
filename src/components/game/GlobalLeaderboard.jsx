import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { motion } from 'framer-motion';
import { Trophy, Globe, Menu, ArrowLeft, Crown } from 'lucide-react';

const GlobalLeaderboard = () => {
  const { setPhase, resetGame, globalLeaderboard } = useGameStore();

  // Get top players from actual game data
  const topPlayers = globalLeaderboard.slice(0, 10);

  // Mock Weekly Challenge (could be enhanced with real data later)
  const weeklyChallenge = {
    title: "Category: Quantum Physics",
    timeLeft: "2 Days Remaining",
    topPrize: "10,000 XP"
  };

  // Mock current user stats (p1 is current user)
  const userStats = globalLeaderboard.find(p => p.player_id === 'p1');
  const userRank = globalLeaderboard.findIndex(p => p.player_id === 'p1') + 1;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 min-h-screen flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => { resetGame(); }}>
          <ArrowLeft size={20} /> BACK TO LOBBY
        </Button>
        <h1 className="text-3xl font-display font-black text-white flex items-center gap-3">
          <Globe className="text-neon-cyan" /> GLOBAL RANKINGS
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Weekly Challenge */}
        <div className="space-y-6">
          <Card className="border-neon-purple/30 bg-gradient-to-br from-purple-900/20 to-black p-6">
            <div className="flex items-start justify-between mb-4">
              <Crown className="text-yellow-400" />
              <span className="text-[10px] bg-purple-500/20 px-2 py-1 rounded text-purple-300 uppercase font-bold">Weekly Event</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{weeklyChallenge.title}</h3>
            <p className="text-gray-400 text-sm mb-4">Submit verified claims in this category to win the bonus pool.</p>
            <div className="text-neon-cyan font-mono text-xs">{weeklyChallenge.timeLeft}</div>
          </Card>

          <Card className="p-6 bg-black/40">
            <h4 className="font-bold text-gray-300 mb-4 uppercase text-xs tracking-wider">Your Stats (All-Time)</h4>
            {userStats ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Rank</span>
                  <span className="text-white font-bold">#{userRank}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Score</span>
                  <span className="text-neon-cyan font-bold">{userStats.total_score}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Games Played</span>
                  <span className="text-white font-bold">{userStats.games_played}</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm italic">Play a game to see your stats!</div>
            )}
          </Card>
        </div>

        {/* Right: Leaderboard List */}
        <div className="md:col-span-2">
          <Card className="overflow-hidden border-white/5">
            <div className="bg-white/5 px-6 py-4 flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span>Rank / Player</span>
              <span>Total XP</span>
            </div>
            <div className="divide-y divide-white/5">
              {topPlayers.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  <Trophy className="mx-auto mb-4 text-gray-700" size={48} />
                  <p className="text-lg font-bold mb-2">No rankings yet!</p>
                  <p className="text-sm">Play games to populate the global leaderboard.</p>
                </div>
              ) : (
                topPlayers.map((p, idx) => {
                  const rank = idx + 1;
                  return (
                    <motion.div
                      key={p.player_id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: rank * 0.1 }}
                      className="px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`font-display font-black text-xl w-8 ${rank === 1 ? 'text-yellow-400 drop-shadow-[0_0_10px_gold]' :
                            rank === 2 ? 'text-gray-300' :
                              rank === 3 ? 'text-amber-700' : 'text-gray-600'
                          }`}>
                          {rank}
                        </div>
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl shadow-inner">
                            {p.avatar}
                          </div>
                          {rank === 1 && <Crown size={12} className="absolute -top-1 -right-1 text-yellow-500 rotate-12" />}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-neon-cyan transition-colors">{p.username}</div>
                          <div className="text-[10px] text-gray-500 uppercase">{p.games_played} Games</div>
                        </div>
                      </div>
                      <div className="font-mono text-neon-cyan/80 font-bold">{p.total_score.toLocaleString()}</div>
                    </motion.div>
                  );
                })
              )}
              {/* Ellipsis */}
              <div className="px-6 py-4 text-center text-gray-600 text-xs tracking-widest">. . .</div>
              {/* User Rank Row */}
              <div className="px-6 py-5 flex items-center justify-between bg-neon-cyan/5 border-l-2 border-neon-cyan">
                <div className="flex items-center gap-4">
                  <div className="font-display font-black text-xl w-8 text-neon-cyan">
                    42
                  </div>
                  <div className="w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center text-xl border border-neon-cyan/50">
                    😎
                  </div>
                  <div>
                    <div className="font-bold text-white">YOU</div>
                    <div className="text-[10px] text-gray-400">Rookie</div>
                  </div>
                </div>
                <div className="font-mono text-white font-bold">1,250</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GlobalLeaderboard;
