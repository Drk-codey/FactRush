import React, { useEffect } from 'react';
import { useGameStore } from './stores/gameStore';
import Lobby from './components/layout/Lobby';
import ClaimSubmission from './components/game/ClaimSubmission';
import AIVerification from './components/game/AIVerification';
import DisputeArena from './components/game/DisputeArena';
import Leaderboard from './components/game/Leaderboard';
import GlobalLeaderboard from './components/game/GlobalLeaderboard';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const { phase } = useGameStore();

  useEffect(() => {
    // Prevent browser refresh if game in progress (optional)
    const handleBeforeUnload = (e) => {
      if (phase !== 'LOBBY' && phase !== 'LEADERBOARD' && phase !== 'GLOBAL_LEADERBOARD') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [phase]);

  const renderPhase = () => {
    switch (phase) {
      case 'LOBBY':
        return <Lobby />;
      case 'SUBMISSION':
        return <ClaimSubmission />;
      case 'VERIFICATION':
        return <AIVerification />;
      case 'DISPUTE':
        return <DisputeArena />;
      case 'LEADERBOARD':
        return <Leaderboard />;
      case 'GLOBAL_LEADERBOARD':
        return <GlobalLeaderboard />;
      default:
        return <Lobby />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-white selection:bg-neon-cyan selection:text-black font-sans overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-noise opacity-[0.03]"></div>
        {/* Animated Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      </div>

      <main className="relative z-10 p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="w-full"
          >
            {renderPhase()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
