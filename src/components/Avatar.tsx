import React from 'react';
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';

interface AvatarProps {
  energy: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ energy, className }) => {
  // Determine expression and glow based on energy
  let expression = '😐'; // neutral
  let glowColor = 'rgba(0, 240, 255, 0.4)';
  
  if (energy > 20) {
    expression = '😃'; // happy
    glowColor = 'rgba(0, 255, 157, 0.5)';
  } else if (energy < -20) {
    expression = '😟'; // worried
    glowColor = 'rgba(255, 42, 42, 0.5)';
  }

  return (
    <div className={cn('relative flex items-center justify-center p-2', className)}>
      {/* Orbital Ring 1 */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-t-transparent border-r-transparent border-b-white/20 border-l-white/20"
      />
      {/* Orbital Ring 2 (reverse) */}
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute inset-1 rounded-full border border-t-white/30 border-r-transparent border-b-transparent border-l-transparent"
      />

      <motion.div 
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full glass-panel flex items-center justify-center text-3xl sm:text-4xl overflow-hidden relative"
        style={{ boxShadow: `0 0 20px ${glowColor}, inset 0 0 10px ${glowColor}` }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Core background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] to-[#020617] opacity-80" />
        
        {/* Holographic lines */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)' }}>
        </div>

        {/* Emoji Avatar */}
        <motion.span 
          key={expression}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative z-10 drop-shadow-md"
        >
          {expression}
        </motion.span>
        
        {/* Helmet glass reflection */}
        <div className="absolute top-1 left-2 w-5 h-2.5 bg-gradient-to-b from-white/40 to-transparent rounded-full rotate-[-40deg] z-20 blur-[1px]"></div>
      </motion.div>
    </div>
  );
};
