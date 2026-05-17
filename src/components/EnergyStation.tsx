import React from 'react';
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';

interface EnergyStationProps {
  energy: number;
}

export const EnergyStation: React.FC<EnergyStationProps> = ({ energy }) => {
  // Determine state based on E
  let stateClass = '';
  let displayColor = 'text-pos-1';
  let glowClass = 'glow-intense-pos';
  let progressColor = '#00f0ff';
  
  if (energy > 70) {
    stateClass = 'bg-[#061a14] border-[#00ff9d]';
    displayColor = 'text-[#00ff9d]';
    glowClass = 'shadow-[0_0_30px_rgba(0,255,157,0.4),inset_0_0_20px_rgba(0,255,157,0.2)]';
    progressColor = '#00ff9d';
  } else if (energy > 20) {
    stateClass = 'bg-[#04121f] border-[#00f0ff]';
    displayColor = 'text-[#00f0ff]';
    glowClass = 'shadow-[0_0_30px_rgba(0,240,255,0.4),inset_0_0_20px_rgba(0,240,255,0.2)]';
    progressColor = '#00f0ff';
  } else if (energy >= -20) {
    stateClass = 'bg-[#1f1a04] border-[#ffd700]';
    displayColor = 'text-[#ffd700]';
    glowClass = 'shadow-[0_0_25px_rgba(255,215,0,0.3),inset_0_0_15px_rgba(255,215,0,0.15)]';
    progressColor = '#ffd700';
  } else if (energy > -70) {
    stateClass = 'bg-[#1f0a04] border-[#ff5500]';
    displayColor = 'text-[#ff5500]';
    glowClass = 'shadow-[0_0_30px_rgba(255,85,0,0.4),inset_0_0_15px_rgba(255,85,0,0.2)]';
    progressColor = '#ff5500';
  } else {
    stateClass = 'bg-[#1a0404] border-[#ff2a2a]';
    displayColor = 'text-[#ff2a2a]';
    glowClass = 'shadow-[0_0_40px_rgba(255,42,42,0.6),inset_0_0_25px_rgba(255,42,42,0.3)]';
    progressColor = '#ff2a2a';
  }

  const sign = energy > 0 ? '+' : '';
  const progressPercent = Math.min(100, Math.max(0, (energy + 100) / 2)); // map -100..100 to 0..100
  const circumference = 2 * Math.PI * 45; // radius 45
  const offset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="relative w-56 h-56 mx-auto my-8 flex items-center justify-center">
      {/* Outer spinning dashed ring */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-dashed border-white/20"
      />
      
      {/* SVG Progress Ring */}
      <svg className="absolute inset-2 w-52 h-52 -rotate-90 transform" viewBox="0 0 100 100">
        <circle 
          cx="50" cy="50" r="45" 
          fill="none" 
          stroke="rgba(255,255,255,0.05)" 
          strokeWidth="4" 
        />
        <motion.circle 
          cx="50" cy="50" r="45" 
          fill="none" 
          stroke={progressColor} 
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, type: "spring", bounce: 0.2 }}
          style={{ 
            strokeDasharray: circumference,
            filter: `drop-shadow(0 0 8px ${progressColor})`
          }}
        />
      </svg>

      {/* Core Reactor */}
      <motion.div 
        className={cn(
          "relative w-36 h-36 rounded-full border border-white/10 flex flex-col items-center justify-center backdrop-blur-xl transition-colors duration-700 z-10",
          stateClass
        )}
        style={{ boxShadow: glowClass.replace('shadow-[', '').replace(']', '') }}
        animate={energy < -70 ? { scale: [1, 0.95, 1.05, 1], x: [-2, 2, -1, 1, 0] } : { scale: 1 }}
        transition={energy < -70 ? { duration: 0.2, repeat: Infinity } : { duration: 0.3 }}
      >
        <span className="text-xs font-exo text-text-muted uppercase tracking-widest mb-1 opacity-80">Energy</span>
        <motion.span 
          key={energy}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn("text-5xl font-orbitron font-bold text-glow transition-colors duration-700", displayColor)}
        >
          {sign}{energy}
        </motion.span>
        
        {/* Cracks for < -70 */}
        {energy < -70 && (
          <svg className="absolute inset-0 w-full h-full text-[#ff2a2a] opacity-60" viewBox="0 0 100 100">
            <path d="M 50 0 L 45 20 L 55 35 L 40 50 L 60 70 L 50 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M 20 40 L 40 50 L 30 70" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
          </svg>
        )}
      </motion.div>
    </div>
  );
};
