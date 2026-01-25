import React, { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Share2, RotateCcw, Globe } from 'lucide-react';
import confetti from 'canvas-confetti';

const Leaderboard = () => {
  const { players, setPhase, resetGame, saveGameResult } = useGameStore();

  // Scores for players
  const rankedPlayers = [...players].map(p => ({
    ...p,
    score: p.score || 0, // Real score
    accuracy: Math.floor(Math.random() * 20) + 80 // Still mocked accuracy for MVP
  })).sort((a, b) => b.score - a.score);

  useEffect(() => {
    // Save game results to global leaderboard
    saveGameResult();

    // Confetti on mount
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const Pod = ({ player, place, delay }) => (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      className={`flex flex-col items-center ${place === 1 ? '-mt-10' : ''}`}
    >
      <div className="relative">
        {place === 1 && <Trophy className="text-yellow-400 absolute -top-8 left-1/2 -translate-x-1/2 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" size={32} />}
        <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-4 flex items-center justify-center text-4xl bg-gray-900 z-10 relative ${place === 1 ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.4)]' :
          place === 2 ? 'border-gray-300 shadow-[0_0_20px_rgba(209,213,219,0.3)]' :
            'border-amber-700 shadow-[0_0_20px_rgba(180,83,9,0.3)]'
          }`}>
          {player.avatar || '😎'}
          <div className={`absolute -bottom-3 px-2 py-0.5 rounded-full text-xs font-bold text-black ${place === 1 ? 'bg-yellow-400' : place === 2 ? 'bg-gray-300' : 'bg-amber-700'
            }`}>
            #{place}
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="font-bold text-lg">{player.username}</div>
        <div className="text-neon-cyan font-display font-bold text-xl">{player.score} XP</div>
      </div>
      <div className={`w-24 md:w-32 h-32 md:h-48 mt-4 rounded-t-lg bg-gradient-to-b ${place === 1 ? 'from-yellow-400/20 to-transparent border-t border-yellow-400/50' :
        place === 2 ? 'from-gray-300/20 to-transparent border-t border-gray-300/50' :
          'from-amber-700/20 to-transparent border-t border-amber-700/50'
        }`}></div>
    </motion.div>
  );

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[90vh] py-10">
      <h1 className="text-4xl md:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mb-2">
        FINAL SCORES
      </h1>
      <p className="text-neon-purple tracking-widest uppercase text-sm mb-12">Session Complete</p>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 md:gap-12 mb-12 w-full">
        {rankedPlayers[1] && <Pod player={rankedPlayers[1]} place={2} delay={0.2} />}
        {rankedPlayers[0] && <Pod player={rankedPlayers[0]} place={1} delay={0.4} />}
        {rankedPlayers[2] && <Pod player={rankedPlayers[2]} place={3} delay={0.6} />}
      </div>

      {/* Full List */}
      <Card className="w-full max-w-2xl bg-black/40 border-white/5">
        <div className="divide-y divide-white/5">
          {rankedPlayers.map((p, i) => (
            <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <span className="text-gray-500 font-display w-6">{i + 1}</span>
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">{p.avatar || '👤'}</div>
                <div>
                  <div className="font-bold">{p.username}</div>
                  <div className="text-xs text-gray-400">{p.accuracy}% Accuracy</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-neon-cyan">{p.score}</div>
                <div className="text-[10px] text-gray-500">XP Gained</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-4 mt-8">
        <Button variant="secondary" onClick={() => setPhase('GLOBAL_LEADERBOARD')}>
          <Globe size={18} /> GLOBAL LEADERBOARD
        </Button>
        <Button variant="primary" onClick={() => resetGame()}>
          <RotateCcw size={18} /> PLAY AGAIN
        </Button>
      </div>
    </div>
  );
};

export default Leaderboard;
