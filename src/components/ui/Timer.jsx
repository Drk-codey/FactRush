import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Clock } from 'lucide-react';

const Timer = ({ seconds, label = "Time Remaining", onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const intervalRef = useRef(null);

  const hasCompletedRef = useRef(false);

  // Reset timer when initial seconds change
  useEffect(() => {
    setTimeLeft(seconds);
    hasCompletedRef.current = false;
  }, [seconds]);

  // Countdown logic
  useEffect(() => {
    if (timeLeft <= 0) {
      if (onComplete && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onComplete();
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [timeLeft]); // Removed onComplete from dependency to avoid loop if parent recreates it

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLow = timeLeft < 30;
  const isCritical = timeLeft <= 10;
  const progressPercent = Math.min(100, Math.max(0, (timeLeft / (seconds || 1)) * 100));

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-black/20 backdrop-blur-sm rounded-xl border border-white/5 min-w-[140px]">
      <div className="text-gray-400 text-xs uppercase tracking-widest font-display mb-1 opacity-80">{label}</div>
      <div className={cn(
        "flex items-center gap-2 text-3xl font-display font-black tabular-nums transition-all duration-300",
        isCritical ? "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] scale-110" : isLow ? "text-orange-400" : "text-neon-cyan"
      )}>
        <Clock className={cn("w-6 h-6", isCritical && "animate-bounce")} />

        <span className="relative">
          {formatTime(timeLeft)}
        </span>
      </div>
      {/* Progress bar line */}
      <div className="w-full h-1 bg-gray-800 mt-2 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: "linear" }}
          className={cn("h-full", isCritical ? "bg-red-500" : "bg-neon-cyan")}
        />
      </div>
    </div>
  );
};

export default Timer;
