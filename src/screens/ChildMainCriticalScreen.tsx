import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Handshake, Target, Home, AlertTriangle, ClipboardList } from 'lucide-react';
import { StationChests } from '../components/StationChests';

import bgImage from '../assets/BG-min.jpg';
import headerImage from '../assets/header-screen4-min.png';
import stationImage from '../assets/station4-min.png';
import energyImage from '../assets/energy-screen-min.png';

interface StatCardProps {
  title: string;
  value: string;
  percentage: number;
  colorHex: string;
  colorClass: string;
  Icon: React.ElementType;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, percentage, colorHex, Icon }) => {
  return (
    <div 
      className="glass-panel flex flex-col justify-between p-2.5 rounded-2xl overflow-hidden relative"
      style={{
        borderColor: `${colorHex}66`, // 40% opacity border
        boxShadow: `0 4px 20px -2px ${colorHex}22`,
      }}
    >
      <div className="flex justify-between items-center mb-1.5 z-10">
        <div className="flex items-center gap-1.5">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: colorHex }} />
          <span className="font-montserrat font-bold text-xs sm:text-sm tracking-wide text-white drop-shadow-md">
            {title}
          </span>
        </div>
        <span className="font-nunito font-extrabold text-base sm:text-lg" style={{ color: colorHex, textShadow: `0 0 10px ${colorHex}66` }}>
          {value}
        </span>
      </div>
      
      {/* Progress Bar Container */}
      <div className="w-full h-5 sm:h-6 rounded-full bg-black/40 relative border border-white/10 overflow-hidden flex items-center justify-center z-10">
        {/* Fill */}
        <div 
          className="absolute top-0 left-0 h-full rounded-full"
          style={{ 
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${colorHex}33 0%, ${colorHex} 100%)`,
            boxShadow: `0 0 10px ${colorHex}66`
          }}
        />
        {/* Text */}
        <span className="font-nunito font-bold text-[10px] sm:text-[11px] text-white z-20 drop-shadow-md">
          {percentage}%
        </span>
      </div>
    </div>
  );
};

import { useAppStore } from '../store';

// (skip to Component)
export const ChildMainCriticalScreen: React.FC = () => {
  const navigate = useNavigate();
  const { energy, spheres } = useAppStore();

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#0a0202] flex flex-col items-center">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-1000" 
        style={{backgroundImage: `url(${bgImage})`}}
      ></div>
      
      {/* Red Emergency Overlays */}
      <motion.div 
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="fixed inset-0 z-0 bg-red-900/30 mix-blend-color-burn pointer-events-none"
      ></motion.div>
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-red-950/90 via-transparent to-red-900/20 pointer-events-none"></div>

      {/* Foreground Container */}
      <div className="station-layout relative z-10 w-full max-w-md mx-auto px-4">
        
        {/* Header */}
        <motion.div 
          className="w-full z-30 shrink-0 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <img src={headerImage} alt="Header Critical" className="w-full h-auto object-contain drop-shadow-[0_4px_25px_rgba(239,68,68,0.4)]" />
          
          {/* History Log Button */}
          <div className="absolute -bottom-14 sm:-bottom-16 left-2 sm:left-4 z-30">
            <motion.button 
              onClick={() => navigate('/log')}
              className="glass-panel p-2.5 rounded-xl border border-red-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.15)] bg-red-950/40"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
              whileTap={{ scale: 0.95 }}
              style={{ backdropFilter: 'blur(10px)' }}
            >
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-red-200 drop-shadow-md" />
            </motion.button>
          </div>
        </motion.div>

        {/* Station + Energy Composition */}
        <div className="station-hero">
          <div className="station-hero-art">
            {/* Critical Station */}
            <motion.div 
              className="w-full h-full flex items-center justify-center z-10"
              animate={{ y: [-2, 2, -2], rotate: [-0.5, 0.5, -0.5] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <img src={stationImage} alt="Station Critical" className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(239,68,68,0.3)]" />
            </motion.div>
          </div>

            {/* Fixed Energy indicator - Distance slightly reduced by 25-30% */}
            <div className="station-energy">
              <img 
                src={energyImage} 
                alt="Energy" 
                className="w-full h-auto object-contain drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" 
                style={{ filter: 'hue-rotate(140deg) saturate(200%) brightness(80%)' }} // Attempt to tint the generic energy image towards red/orange
              />
              <div className="absolute flex items-center justify-center gap-1 pl-1">
                <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
                <span className="font-montserrat font-black text-3xl sm:text-4xl text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.9)] tracking-wider">
                  {energy > 0 ? '+' : ''}{Math.round(energy)}
                </span>
              </div>
            </div>
        </div>

        {/* Stats Grid - All turned to critical/red colors and low values */}
        <motion.div 
          className="station-stats shrink-0"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {spheres.map((s) => {
            let Icon = s.id === 'study' ? BookOpen : s.id === 'respect' ? Handshake : s.id === 'focus' ? Target : Home;
            let colorHex = s.id === 'study' ? '#ef4444' : s.id === 'respect' ? '#f97316' : s.id === 'focus' ? '#f43f5e' : '#dc2626';
            let colorClass = s.id === 'study' ? 'text-red-500' : s.id === 'respect' ? 'text-orange-500' : s.id === 'focus' ? 'text-rose-500' : 'text-red-600';
            return (
              <StatCard 
                key={s.id}
                title={s.name.toUpperCase()} 
                value={(s.score / 10).toFixed(1)} 
                percentage={Math.round(s.score)} 
                colorHex={colorHex} 
                colorClass={colorClass} 
                Icon={Icon} 
              />
            );
          })}
        </motion.div>

        <StationChests />

      </div>
    </div>
  );
};
