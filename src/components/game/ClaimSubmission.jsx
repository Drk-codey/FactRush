import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Timer from '../ui/Timer';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Globe, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { getRandomBotClaim } from '../../lib/botLogic';
import confetti from 'canvas-confetti';

const ClaimSubmission = () => {
  const { addClaim, claims, room, players, setPhase } = useGameStore();
  const [claimText, setClaimText] = useState('');
  const [confidence, setConfidence] = useState(75);
  const [sourceKey, setSourceKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [combo, setCombo] = useState(0);

  // --- BOT LOGIC ---
  useEffect(() => {
    const bots = players.filter(p => p.is_bot);
    if (bots.length === 0) return;

    const botIntervals = bots.map(bot => {
      // Randomize submission freq based on 'bot skill' concept (simple random for now)
      const delay = Math.random() * 10000 + 5000; // 5-15s
      return setInterval(() => {
        if (Math.random() > 0.3) { // 70% chance to submit
          const claimContent = getRandomBotClaim(room.category, room.difficulty);
          addClaim({
            id: `c_${Date.now()}_${bot.id}`,
            room_id: room.room_code,
            player_id: bot.id,
            content: claimContent,
            confidence_score: Math.floor(Math.random() * 30) + 70,
            source_url: '',
            status: 'PENDING',
            type: 'Quick Fact'
          });
        }
      }, delay);
    });

    return () => botIntervals.forEach(clearInterval);
  }, [players, room, addClaim]);
  // ----------------

  const handleSubmit = async () => {
    if (!claimText.trim()) return;
    setIsSubmitting(true);

    // Simulate delay/network
    await new Promise(r => setTimeout(r, 400));

    addClaim({
      id: Math.random().toString(), // temp ID
      room_id: room.room_code,
      player_id: 'p1', // Current user ID (hardcoded in Lobby logic initially)
      content: claimText,
      confidence_score: confidence,
      source_url: sourceKey,
      status: 'PENDING',
      type: 'Quick Fact' // Auto-detect logic would go here
    });

    // Visual Reward
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8, x: 0.5 },
      colors: ['#00f5ff', '#a855f7'],
      disableForReducedMotion: true
    });

    setCombo(c => c + 1);
    setClaimText('');
    setSourceKey('');
    setConfidence(75);
    setIsSubmitting(false);

    // Reset combo after inactivity
    setTimeout(() => setCombo(0), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-6 p-4">
      {/* LEFT: Input Zone */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
          <div>
            <h2 className="text-3xl font-display font-black text-white leading-none">SUBMIT <span className="text-neon-cyan">TRUTHS</span></h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{room?.category}</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${room?.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}>{room?.difficulty}</span>
            </div>
          </div>
          <div className="scale-90 origin-right">
            <Timer
              seconds={(room?.duration || 5) * 60}
              onComplete={() => setPhase('VERIFICATION')}
            />
          </div>
        </div>

        <Card className="flex-1 flex flex-col p-6 border-neon-cyan/20 bg-gradient-to-b from-gray-900/90 to-black/90 relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 p-32 bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="space-y-6 relative z-10 flex-1 flex flex-col justify-center">
            {combo > 1 && (
              <div className="absolute top-0 right-0 text-neon-purple font-display font-black italic text-4xl animate-bounce">
                {combo}x COMBO!
              </div>
            )}

            <div className="relative group">
              <label className="text-xs uppercase font-bold text-gray-500 mb-2 block flex items-center gap-2">
                <Sparkles size={12} className="text-yellow-400" /> claim statement
              </label>
              <textarea
                value={claimText}
                onChange={(e) => setClaimText(e.target.value)}
                className="w-full bg-black/40 border border-gray-700/50 rounded-2xl p-6 text-xl md:text-2xl font-medium text-white placeholder-gray-700 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all resize-none shadow-inner h-48"
                placeholder="Assert a fact here..."
                autoFocus
              />
              <div className="absolute bottom-4 right-4 text-xs font-mono text-gray-600 group-focus-within:text-neon-cyan transition-colors">
                {claimText.length}/200
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
              <div>
                <label className="text-xs uppercase font-bold text-gray-500 mb-3 block flex justify-between">
                  <span>Confidence Level</span>
                  <span className={confidence > 80 ? "text-neon-lime" : "text-neon-purple"}>{confidence}%</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={confidence}
                  onChange={(e) => setConfidence(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-cyan hover:accent-neon-lime transition-all"
                />
              </div>

              <div>
                <div className="relative group">
                  <Globe className="absolute left-4 top-3.5 text-gray-600 group-focus-within:text-neon-cyan transition-colors" size={18} />
                  <input
                    type="text"
                    value={sourceKey}
                    onChange={(e) => setSourceKey(e.target.value)}
                    className="w-full bg-black/40 border border-gray-700/50 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-neon-cyan outline-none transition-all"
                    placeholder="Backup Source (URL)"
                  />
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full mt-4 shadow-[0_0_20px_rgba(0,245,255,0.25)] hover:shadow-[0_0_30px_rgba(0,245,255,0.5)]"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={!claimText.trim()}
            >
              <Send size={20} className="mr-2" /> SUBMIT CLAIM
            </Button>
          </div>
        </Card>
      </div>

      {/* RIGHT: Live Feed */}
      <div className="lg:w-[350px] flex flex-col h-full border-l border-white/5 pl-4 lg:pl-6 bg-black/20 backdrop-blur-sm rounded-r-xl">
        <h3 className="font-display font-bold text-gray-300 mb-4 flex items-center gap-2 pt-2 uppercase tracking-widest text-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-lime opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-lime"></span>
          </span>
          Live Feed
        </h3>

        <div className="flex-1 overflow-y-auto space-y-4 pr-3 custom-scrollbar mask-image-b">
          <AnimatePresence mode="popLayout">
            {claims.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-600 mt-20 italic px-8">
                The feed is empty. Be the first to verify truth!
              </motion.div>
            )}
            {claims.sort((a, b) => b.id.localeCompare(a.id)).map((claim) => {
              const isBot = claim.id.startsWith('c_') && claim.id.includes('bot');
              const player = players.find(p => p.id === claim.player_id);

              return (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0, x: 50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  layout
                  className={`rounded-xl p-4 relative overflow-hidden group hover:scale-[1.02] transition-transform ${isBot ? 'bg-gray-900/60 border border-gray-800' : 'bg-gray-800/80 border border-gray-700'
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-xs">
                        {player?.avatar || '👤'}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 truncate max-w-[80px]">
                        {player?.username || 'Unknown'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-neon-purple bg-neon-purple/10 px-1.5 py-0.5 rounded">{claim.confidence_score}%</span>
                  </div>
                  <p className="text-sm text-gray-200 leading-snug font-medium line-clamp-3">"{claim.content}"</p>

                  {claim.source_url && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-neon-cyan">
                      <Globe size={10} /> Source Linked
                    </div>
                  )}

                  {/* Decorative Corner */}
                  <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none"></div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ClaimSubmission;
