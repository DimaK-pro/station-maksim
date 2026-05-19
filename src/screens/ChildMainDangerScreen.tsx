import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Handshake, Target, Home, AlertTriangle, ClipboardList } from 'lucide-react';
import { StationChests } from '../components/StationChests';

import bgImage from '../assets/BG-min.jpg';
import headerImage from '../assets/header-screen4-min.png'; // Red header from screen 4
import stationImage from '../assets/station3-min.png'; // Station 3
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
export const ChildMainDangerScreen: React.FC = () => {
  const navigate = useNavigate();
  const { energy, spheres } = useAppStore();

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#090402] flex flex-col items-center">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center" 
        style={{backgroundImage: `url(${bgImage})`}}
      ></div>
      
      {/* Red danger overlay */}
      <motion.div 
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="fixed inset-0 z-0 bg-red-900/15 mix-blend-color-burn pointer-events-none"
      ></motion.div>
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-red-950/80 via-transparent to-red-950/20 pointer-events-none"></div>

      <div className="station-layout relative z-10 w-full max-w-md mx-auto px-4">
        
        {/* Header - from screen 4 (red) */}
        <motion.div 
          className="w-full z-30 shrink-0 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <img src={headerImage} alt="Header Danger" className="w-full h-auto object-contain drop-shadow-[0_4px_20px_rgba(239,68,68,0.3)]" />
          
          <div className="absolute -bottom-14 sm:-bottom-16 left-2 sm:left-4 z-30">
            <motion.button 
              onClick={() => navigate('/log')}
              className="glass-panel p-2.5 rounded-xl border border-red-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.1)] bg-red-950/30"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
              whileTap={{ scale: 0.95 }}
              style={{ backdropFilter: 'blur(10px)' }}
            >
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-red-200 drop-shadow-md" />
            </motion.button>
          </div>
        </motion.div>

        <div className="station-hero">
          <div className="station-hero-art">
            {/* Station 3 */}
            <motion.div 
              className="w-full h-full flex items-center justify-center z-10"
              animate={{ y: [-2, 2, -2], rotate: [-0.6, 0.6, -0.6] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            >
              <img src={stationImage} alt="Station Danger" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(239,68,68,0.25)]" />
            </motion.div>
          </div>

            {/* Energy: 2 yellow divisions, but keep the plate color original blue/cyan */}
            <div className="station-energy">
              <img 
                src={energyImage} 
                alt="Energy" 
                className="w-full h-auto object-contain drop-shadow-[0_0_15px_rgba(0,255,255,0.3)]" 
              />
              <div className="absolute flex items-center justify-center gap-1 pl-1">
                <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                <span className="font-montserrat font-black text-3xl sm:text-4xl text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] tracking-wider">
                  {energy > 0 ? '+' : ''}{Math.round(energy)}
                </span>
              </div>
            </div>
        </div>

        {/* Stats Grid - Lowered, colors shifting to orange/red */}
        <motion.div 
          className="station-stats shrink-0"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {spheres.map((s) => {
            let Icon = s.id === 'study' ? BookOpen : s.id === 'respect' ? Handshake : s.id === 'focus' ? Target : Home;
            let colorHex = s.id === 'study' ? '#f97316' : s.id === 'respect' ? '#f43f5e' : s.id === 'focus' ? '#ef4444' : '#ea580c';
            let colorClass = s.id === 'study' ? 'text-orange-500' : s.id === 'respect' ? 'text-rose-500' : s.id === 'focus' ? 'text-red-500' : 'text-orange-600';
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
