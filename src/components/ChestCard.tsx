import React from 'react';
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';

interface ChestCardProps {
  type: 'reward' | 'consequence';
  status: 'locked' | 'active' | 'cooldown';
  onClick: () => void;
  days?: number;
}

export const ChestCard: React.FC<ChestCardProps> = ({ type, status, onClick, days }) => {
  const isReward = type === 'reward';
  const isActive = status === 'active';
  
  const baseClasses = "relative flex-1 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 glass-panel";
  
  let stateClasses = "";
  let title = isReward ? "НАГРАДЫ" : "ПОСЛЕДСТВИЯ";
  let icon = isReward ? "🎁" : "💊";
  let glowClass = "";
  
  if (isActive) {
    stateClasses = isReward 
      ? "border-[#ffd700] bg-gradient-to-b from-[#ffd700]/10 to-transparent" 
      : "border-[#ff2a2a] bg-gradient-to-b from-[#ff2a2a]/10 to-transparent";
    glowClass = isReward ? "glow-intense-pos" : "glow-intense-neg";
  } else if (status === 'locked') {
    stateClasses = "border-white/5 opacity-50 cursor-not-allowed grayscale";
    icon = "🔒";
  } else if (status === 'cooldown') {
    stateClasses = "border-white/10 opacity-70 cursor-not-allowed";
  }

  const handleClick = () => {
    if (isActive) {
      onClick();
    }
  };

  return (
    <motion.div 
      className={cn(baseClasses, stateClasses)} 
      onClick={handleClick}
      style={{ boxShadow: isActive ? glowClass.replace('shadow-[', '').replace(']', '') : undefined }}
      whileHover={isActive ? { scale: 1.05, y: -5 } : {}}
      whileTap={isActive ? { scale: 0.95 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Sci-fi overlay scan lines */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)' }}>
      </div>
      
      {/* Active inner glow */}
      {isActive && (
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={cn("absolute inset-0 rounded-2xl", isReward ? "shadow-[inset_0_0_20px_rgba(255,215,0,0.3)]" : "shadow-[inset_0_0_20px_rgba(255,42,42,0.3)]")}
        />
      )}
      
      <motion.span 
        className="text-5xl mb-3 relative z-10 filter drop-shadow-lg"
        animate={isActive ? { y: [0, -5, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {icon}
      </motion.span>
      
      <span className="font-orbitron font-bold text-sm tracking-wider relative z-10 text-white text-glow-sm">
        {title}
      </span>
      
      {status === 'cooldown' && days !== undefined && (
        <span className="text-xs font-exo text-text-muted mt-2 relative z-10 bg-black/40 px-3 py-1 rounded-full border border-white/10">
          Через {days} {days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}
        </span>
      )}
      
      {isActive && (
        <span className="text-xs font-exo font-bold mt-2 text-black bg-white px-4 py-1 rounded-full relative z-10 shadow-[0_0_10px_white]">
          ОТКРЫТЬ
        </span>
      )}
    </motion.div>
  );
};
