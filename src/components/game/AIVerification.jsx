import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { calculateClaimScore } from '../../utils/scoring';
import Card from '../ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, CheckCircle, XCircle, AlertTriangle, Activity, Loader } from 'lucide-react';
import { genLayer } from '../../lib/genlayer';

const AIVerification = () => {
  const { claims, setPhase, updateClaim, updatePlayerScore } = useGameStore();
  const [progress, setProgress] = useState(0);
  const [currentCheckingIndex, setCurrentCheckingIndex] = useState(0);
  const [log, setLog] = useState([]); // Real-time consensus log
  const [activeValidators, setActiveValidators] = useState([]);

  useEffect(() => {
    // Check if we need to advance to Dispute phase
    if (currentCheckingIndex >= claims.length) {
      if (claims.length > 0) {
        setTimeout(() => setPhase('DISPUTE'), 3000);
      } else {
        // Edge case: no claims
        setTimeout(() => setPhase('DISPUTE'), 1000);
      }
      return;
    }

    const claim = claims[currentCheckingIndex];
    if (claim.status !== 'PENDING') {
      setCurrentCheckingIndex(prev => prev + 1);
      return;
    }

    // Start GenLayer Simulation for this claim
    const runVerification = async () => {
      setProgress(0);
      setLog([]);

      await genLayer.verifyClaim(claim, (event) => {
        // Handle Events
        if (event.type === 'INIT') {
          setActiveValidators(event.validators);
          setLog(prev => [...prev, { text: "Initializing Intelligent Contract...", color: "text-gray-400" }]);
        }
        if (event.type === 'VALIDATOR_START') {
          setLog(prev => [...prev, { text: event.message, color: "text-neon-cyan" }]);
        }
        if (event.type === 'VOTE_CAST') {
          setProgress(p => Math.min(p + 30, 90)); // Increment progress
          const color = event.vote.status === 'VERIFIED' ? 'text-neon-lime' :
            event.vote.status === 'FALSE' ? 'text-red-500' : 'text-yellow-500';
          setLog(prev => [...prev, { text: `> Vote: ${event.vote.status}`, color }]);
        }
        if (event.type === 'CONSENSUS_REACHED') {
          setProgress(100);
          setLog(prev => [...prev, { text: event.message, color: "text-white font-bold" }]);

          // Calculate Points
          const points = event.result.status === 'VERIFIED' ? calculateClaimScore(claim.type || 'Quick Fact', claim.confidence_score, !!claim.source_url) : 0;

          // Update Store
          updateClaim({
            ...claim,
            status: event.result.status,
            ai_verdict: event.result,
            points_awarded: points
          });

          if (points > 0) {
            updatePlayerScore(claim.player_id, points);
          }

          // Wait then next
          setTimeout(() => setCurrentCheckingIndex(prev => prev + 1), 500);
        }
      });
    };

    runVerification();

  }, [currentCheckingIndex, claims.length]);

  const currentClaim = claims[currentCheckingIndex];

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center min-h-[80vh] gap-12 p-4">

      {/* Left: Visualization */}
      <div className="flex flex-col items-center flex-1">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-display font-black text-white">AI CONSENSUS <span className="text-neon-cyan">LAYER</span></h2>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 uppercase tracking-widest">
            <Activity size={12} className="text-neon-purple animate-pulse" />
            <span>Optimistic Democracy Protocol Active</span>
          </div>
        </div>

        <div className="relative w-72 h-72 flex items-center justify-center mb-8">
          {/* Orbital Rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-dashed border-gray-700/50 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-8 border border-gray-800 rounded-full"
          />

          {/* Active Validators Nodes */}
          {activeValidators.length > 0 ? (
            activeValidators.map((v, i) => {
              const deg = (360 / activeValidators.length) * i;
              return (
                <motion.div
                  key={v.id}
                  className="absolute w-12 h-12 bg-black border border-neon-cyan/50 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,245,255,0.3)] z-10"
                  initial={{ scale: 0 }}
                  animate={{
                    scale: 1,
                    x: 120 * Math.cos(deg * Math.PI / 180),
                    y: 120 * Math.sin(deg * Math.PI / 180),
                  }}
                >
                  <Bot size={20} className="text-neon-cyan" />
                </motion.div>
              );
            })
          ) : (
            // Default idle nodes
            [0, 120, 240].map((deg, i) => (
              <motion.div
                key={i}
                className="absolute w-10 h-10 bg-gray-900 border border-gray-800 rounded-full z-10 opacity-50"
                style={{ top: '50%', left: '50%', marginLeft: '-20px', marginTop: '-20px' }}
                animate={{
                  x: 120 * Math.cos(deg * Math.PI / 180),
                  y: 120 * Math.sin(deg * Math.PI / 180),
                }}
              />
            ))
          )}

          {/* Central Progress */}
          <div className="relative z-20 w-36 h-36 bg-gray-900 rounded-full flex items-center justify-center border-4 border-gray-800 shadow-2xl">
            <span className="text-3xl font-bold font-display">{progress}%</span>
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1">
              <circle cx="68" cy="68" r="64" fill="none" stroke="#1f2937" strokeWidth="4" />
              <motion.circle
                cx="68" cy="68" r="64"
                fill="none"
                stroke={progress >= 100 ? "#39ff14" : "#00f5ff"}
                strokeWidth="4"
                strokeDasharray="402"
                strokeDashoffset={402 - (402 * progress) / 100}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Processed Claims Tally */}
        <div className="flex gap-2 justify-center flex-wrap max-w-sm">
          {claims.map((c, i) => (
            <div key={c.id} className={`w-3 h-3 rounded-full transition-all duration-500 ${c.status === 'PENDING' ? 'bg-gray-800' :
              c.status === 'VERIFIED' ? 'bg-neon-lime shadow-[0_0_10px_lime] scale-125' :
                c.status === 'FALSE' ? 'bg-red-500 shadow-[0_0_10px_red] scale-125' :
                  'bg-yellow-500 shadow-[0_0_10px_yellow] scale-125'
              }`} />
          ))}
        </div>
      </div>

      {/* Right: Terminal Log & Content */}
      <div className="w-full md:max-w-lg flex-1">
        <Card className="h-[450px] flex flex-col font-mono text-sm border-neon-cyan/20 bg-black/90 backdrop-blur-xl relative overflow-hidden">
          {/* Scanline effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,3px_100%]"></div>

          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 relative z-10">
            <span className="text-gray-400">Target: <span className="text-white italic">"{currentClaim?.content.substring(0, 30) || 'Standby'}..."</span></span>
            {currentClaim?.type && <span className="text-[10px] bg-gray-800 border border-gray-700 px-2 py-1 rounded text-gray-300">{currentClaim.type}</span>}
          </div>

          {/* Terminal Output */}
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 relative z-10 p-2">
            {currentCheckingIndex < claims.length ? (
              log.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start gap-3 ${entry.color}`}
                >
                  <span className="opacity-40 text-[10px] mt-1 shrink-0 font-sans">{new Date().toLocaleTimeString().split(' ')[0]}</span>
                  <div>{entry.text}</div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <CheckCircle size={48} className="text-neon-lime" />
                <div>
                  <h3 className="text-xl font-bold text-white">Batched Verification Complete</h3>
                  <p className="text-gray-500">All claims processed by Intelligent Contract.</p>
                </div>
                <div className="text-xs text-gray-600 animate-pulse">Redirecting to Dispute Arena...</div>
              </div>
            )}
            {log.length === 0 && currentCheckingIndex < claims.length && (
              <span className="text-gray-600 animate-pulse flex items-center gap-2">
                <Loader size={12} className="animate-spin" /> Connecting to Validator Nodes...
              </span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIVerification;
