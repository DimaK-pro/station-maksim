import React from 'react';
import { Sphere } from '../mockData';
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';

interface SphereCardProps {
  sphere: Sphere;
}

export const SphereCard: React.FC<SphereCardProps> = ({ sphere }) => {
  // Score 0 to 10
  const percentage = (sphere.score / 10) * 100;
  
  let progressColor = '#00f0ff'; // pos-1
  let glowColor = 'shadow-[0_0_15px_rgba(0,240,255,0.6)]';
  if (sphere.score >= 8) {
    progressColor = '#00ff9d'; // pos-2
    glowColor = 'shadow-[0_0_15px_rgba(0,255,157,0.6)]';
  } else if (sphere.score < 4) {
    progressColor = '#ff2a2a'; // neg-3
    glowColor = 'shadow-[0_0_15px_rgba(255,42,42,0.6)]';
  } else if (sphere.score < 6) {
    progressColor = '#ffd700'; // neg-1
    glowColor = 'shadow-[0_0_15px_rgba(255,215,0,0.6)]';
  }

  return (
    <motion.div 
      className="glass-panel rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Subtle background glow based on score */}
      <div 
        className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20"
        style={{ backgroundColor: progressColor }}
      ></div>

      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]">
            {sphere.emoji}
          </div>
          <span className="font-exo font-bold tracking-wide text-sm text-white/90">{sphere.name}</span>
        </div>
        <span 
          className="font-orbitron font-bold text-lg"
          style={{ color: progressColor, textShadow: `0 0 10px ${progressColor}80` }}
        >
          {sphere.score.toFixed(1)}
        </span>
      </div>
      
      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5 relative z-10">
        <motion.div 
          className={cn("h-full rounded-full")}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, type: "spring", bounce: 0.1 }}
          style={{ 
            backgroundColor: progressColor,
            boxShadow: glowColor.replace('shadow-[', '').replace(']', '')
          }}
        />
      </div>
    </motion.div>
  );
};
