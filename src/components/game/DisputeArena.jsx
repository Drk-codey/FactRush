import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Timer from '../ui/Timer';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, ThumbsUp, ThumbsDown, AlertOctagon, ArrowRight, Home, SkipForward } from 'lucide-react';

const DisputeArena = () => {
  const { claims, addDispute, setPhase, disputes, resetGame } = useGameStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reasoning, setReasoning] = useState('');
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  // Only show claims that are not PENDING
  const reviewableClaims = claims.filter(c => c.status !== 'PENDING' && c.status !== 'VERIFIED'); // Assuming we focus on questionable ones first, but user can access all usually.
  // For MVP, lets just show ALL processed claims so users can dispute anything.
  const allProcessed = claims.filter(c => c.status !== 'PENDING');

  const currentClaim = allProcessed[currentIndex];

  const handleNext = () => {
    if (currentIndex < allProcessed.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowDisputeForm(false);
      setReasoning('');
    }
  };

  const handleDispute = () => {
    if (!reasoning) return;
    addDispute({
      id: Math.random(),
      claim_id: currentClaim.id,
      reasoning: reasoning,
      status: 'OPEN',
      stake: 50 // Fixed stake for MVP
    });
    handleNext();
  };

  if (!currentClaim) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <h2 className="text-2xl font-display font-bold mb-4">No Claims to Dispute</h2>
      <Button onClick={() => setPhase('LEADERBOARD')}>Go to Leaderboard</Button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-100px)] grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Card Stack / Focus */}
      <div className="lg:col-span-2 flex flex-col items-center justify-center relative">
        <div className="absolute top-0 right-0 z-10">
          <Timer seconds={180} onComplete={() => setPhase('LEADERBOARD')} label="Dispute Phase" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentClaim.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-lg"
          >
            <Card className={`p-8 border-2 ${currentClaim.status === 'VERIFIED' ? 'border-neon-lime/30' :
              currentClaim.status === 'FALSE' ? 'border-red-500/30' :
                'border-yellow-500/30'
              }`}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider">
                  {currentClaim.type}
                </span>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${currentClaim.status === 'VERIFIED' ? 'bg-neon-lime/10 border-neon-lime text-neon-lime' :
                  currentClaim.status === 'FALSE' ? 'bg-red-500/10 border-red-500 text-red-500' :
                    'bg-yellow-500/10 border-yellow-500 text-yellow-500'
                  }`}>
                  AI VERDICT: {currentClaim.status}
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold font-display leading-tight mb-8">
                "{currentClaim.content}"
              </h2>

              {/* AI Reasoning Preview */}
              {currentClaim.ai_verdict && (
                <div className="bg-black/30 p-4 rounded-lg mb-8 text-sm text-gray-400 border-l-2 border-gray-600">
                  <span className="text-neon-cyan font-bold block mb-1">AI Reasoning:</span>
                  {currentClaim.ai_verdict.reasoning}
                </div>
              )}

              {!showDisputeForm ? (
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="secondary" onClick={handleNext}>
                    <ArrowRight /> PASS
                  </Button>
                  <Button variant="danger" className="shadow-[0_0_20px_rgba(239,68,68,0.3)]" onClick={() => setShowDisputeForm(true)}>
                    <Gavel /> DISPUTE VERDICT
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  <textarea
                    className="w-full bg-black/40 border border-red-500/30 rounded-lg p-3 text-white focus:border-red-500 outline-none h-24"
                    placeholder="Why is the AI wrong? Provide evidence..."
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                  />
                  <div className="flex justify-between items-center text-xs text-red-400">
                    <span>Cost: 50 Points</span>
                    <span>Potential Reward: 75 Points</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="secondary" onClick={() => setShowDisputeForm(false)}>CANCEL</Button>
                    <Button variant="danger" onClick={handleDispute} disabled={!reasoning}>CONFIRM DISPUTE</Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex gap-2">
          {allProcessed.map((_, idx) => (
            <div key={idx} className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-gray-700'}`} />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4 w-full max-w-lg">
          <Button variant="ghost" onClick={() => resetGame()} className="flex-1">
            <Home size={18} /> HOME
          </Button>
          <Button variant="primary" onClick={() => setPhase('LEADERBOARD')} className="flex-1">
            <SkipForward size={18} /> SKIP TO RESULTS
          </Button>
        </div>
      </div>

      {/* Right: Active Disputes Ticker */}
      <div className="hidden lg:flex flex-col border-l border-white/5 pl-8">
        <h3 className="font-display font-bold text-gray-300 mb-6 flex items-center gap-2">
          <AlertOctagon className="text-red-500" /> ACTIVE DISPUTES
        </h3>
        <div className="space-y-4">
          {disputes.map((d, i) => (
            <div key={i} className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
              <div className="text-xs text-red-400 font-bold mb-1">DISPUTE #{i + 1}</div>
              <p className="text-sm text-gray-300 italic">"{d.reasoning}"</p>
              <div className="mt-2 text-[10px] text-gray-500">Checking with 5 additional models...</div>
            </div>
          ))}
          {disputes.length === 0 && <div className="text-gray-600 italic text-sm">No active disputes in the arena.</div>}
        </div>
      </div>
    </div>
  );
};
export default DisputeArena;
