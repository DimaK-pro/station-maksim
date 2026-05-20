import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Handshake, Target, Home, Zap, ClipboardList } from 'lucide-react';
import { StationChests } from '../components/StationChests';

import bgImage from '../assets/BG-min.jpg';
import headerImage from '../assets/header-screen1-min.png';
import stationImage from '../assets/station2-min.png';
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
        borderColor: `${colorHex}66`,
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
      
      <div className="w-full h-5 sm:h-6 rounded-full bg-black/40 relative border border-white/10 overflow-hidden flex items-center justify-center z-10">
        <div 
          className="absolute top-0 left-0 h-full rounded-full"
          style={{ 
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${colorHex}33 0%, ${colorHex} 100%)`,
            boxShadow: `0 0 10px ${colorHex}66`
          }}
        />
        <span className="font-nunito font-bold text-[10px] sm:text-[11px] text-white z-20 drop-shadow-md">
          {percentage}%
        </span>
      </div>
    </div>
  );
};

import { useAppStore } from '../store';

// (skip to Component)
export const ChildMainWarningScreen: React.FC = () => {
  const navigate = useNavigate();
  const { energy, spheres } = useAppStore();

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#070b14] flex flex-col items-center">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center" 
        style={{backgroundImage: `url(${bgImage})`}}
      ></div>
      
      <div className="station-layout relative z-10 w-full max-w-md mx-auto px-4">
        
        {/* Header - from screen 1 */}
        <motion.div 
          className="w-full z-30 shrink-0 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <img src={headerImage} alt="Header Warning" className="w-full h-auto object-contain drop-shadow-[0_4px_15px_rgba(0,255,255,0.15)]" />
          
          <div className="absolute -bottom-14 sm:-bottom-16 left-2 sm:left-4 z-30">
            <motion.button 
              onClick={() => navigate('/log')}
              className="glass-panel p-2.5 rounded-xl border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)]"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              whileTap={{ scale: 0.95 }}
              style={{ backdropFilter: 'blur(10px)' }}
            >
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300 drop-shadow-md" />
            </motion.button>
          </div>
        </motion.div>

        <div className="station-hero">
          <div className="station-hero-art">
            {/* Station 2 */}
            <motion.div 
              className="w-full h-full flex items-center justify-center z-10"
              animate={{ y: [-3, 3, -3], rotate: [-0.8, 0.8, -0.8] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            >
              <img src={stationImage} alt="Station Warning" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(0,180,255,0.15)]" />
            </motion.div>
          </div>

            {/* Energy: 3 green divisions roughly, green/lime tint for text only */}
            <div className="station-energy">
              <img 
                src={energyImage} 
                alt="Energy" 
                className="w-full h-auto object-contain drop-shadow-[0_0_15px_rgba(0,255,255,0.3)]" 
              />
              <div className="absolute flex items-center justify-center gap-1 pl-1">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-lime-400 drop-shadow-[0_0_8px_rgba(163,230,53,0.8)] fill-lime-400" />
                <span className="font-montserrat font-black text-3xl sm:text-4xl text-lime-400 drop-shadow-[0_0_8px_rgba(163,230,53,0.8)] tracking-wider">
                  {energy > 0 ? '+' : ''}{Math.round(energy)}
                </span>
              </div>
            </div>
        </div>

        {/* Stats Grid - Lowered, colors shifting to yellow/greenish */}
        <motion.div 
          className="station-stats shrink-0"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {spheres.map((s) => {
            let Icon = s.id === 'study' ? BookOpen : s.id === 'respect' ? Handshake : s.id === 'focus' ? Target : Home;
            let colorHex = s.id === 'study' ? '#84cc16' : s.id === 'respect' ? '#eab308' : s.id === 'focus' ? '#14b8a6' : '#22c55e';
            let colorClass = s.id === 'study' ? 'text-lime-500' : s.id === 'respect' ? 'text-yellow-500' : s.id === 'focus' ? 'text-teal-500' : 'text-green-500';
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
