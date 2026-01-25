import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const Card = ({ children, className, hover = false, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-gradient-to-br from-gray-900/90 to-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 relative overflow-hidden',
        hover && 'hover:border-neon-cyan/30 transition-colors duration-500 group',
        className
      )}
      {...props}
    >
      {/* Subtle glow effect on hover */}
      {hover && (
        <div className="absolute inset-0 bg-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
export default Card;
