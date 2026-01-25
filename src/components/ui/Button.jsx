import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const Button = ({ children, variant = 'primary', size = 'md', className, isLoading, ...props }) => {
  const variants = {
    primary: 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/50 hover:bg-neon-cyan/20 hover:shadow-[0_0_20px_rgba(0,245,255,0.4)]',
    secondary: 'bg-surface-light/30 text-gray-200 hover:bg-surface-light/50 border border-white/10 hover:border-white/20',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]',
    neon: 'bg-neon-purple/10 text-neon-purple border border-neon-purple/50 hover:bg-neon-purple/20 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    ghost: 'bg-transparent hover:bg-white/5 text-gray-400 hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg font-bold tracking-wider',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'rounded-xl font-display uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-md relative overflow-hidden',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      ) : children}
    </motion.button>
  );
};

export default Button;
