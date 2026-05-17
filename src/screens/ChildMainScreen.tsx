import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Handshake, Target, Home, Zap, ClipboardList } from 'lucide-react';

import bgImage from '../assets/BG-min.jpg';
import headerImage from '../assets/header-screen1-min.png';
import stationImage from '../assets/station1-min.png';
import energyImage from '../assets/energy-screen-min.png';
import sundukImage from '../assets/sunduk1-min.png';
import dangerImage from '../assets/danger1-min.png';

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

export const ChildMainScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b14] flex flex-col items-center">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center" 
        style={{backgroundImage: `url(${bgImage})`}}
      ></div>

      {/* Foreground Container */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md mx-auto pt-4 px-4 pb-4 h-[100dvh]">
        
        {/* Header */}
        <motion.div 
          className="w-full z-20 shrink-0 mb-2 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <img src={headerImage} alt="Header" className="w-full h-auto object-contain drop-shadow-[0_4px_15px_rgba(0,255,255,0.15)]" />
          
          {/* History Log Button - Lowered to add more whitespace (air) below the header */}
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

        {/* Station + Energy Composition */}
        <div className="w-full flex-1 flex flex-col items-center justify-center z-10 min-h-0 pointer-events-none mb-4 mt-6">
          
          <div className="relative w-[110%] sm:w-[100%] flex flex-col items-center justify-center">
            {/* Station */}
            <motion.div 
              className="w-full flex items-center justify-center z-10"
              animate={{ y: [-4, 4, -4], rotate: [-1, 1, -1] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              <img src={stationImage} alt="Station" className="w-full h-auto object-contain drop-shadow-[0_0_30px_rgba(0,180,255,0.15)]" />
            </motion.div>

            {/* Fixed Energy indicator - Distance slightly reduced by 25-30% */}
            <div className="w-[35%] sm:w-[30%] relative flex items-center justify-center z-20 shrink-0 -mt-[3%] sm:-mt-[2%]">
              <img src={energyImage} alt="Energy" className="w-full h-auto object-contain drop-shadow-[0_0_15px_rgba(0,255,255,0.3)]" />
              <div className="absolute flex items-center justify-center gap-1 pl-1">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] fill-cyan-400" />
                <span className="font-montserrat font-black text-3xl sm:text-4xl text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] tracking-wider">
                  +47
                </span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Stats Grid */}
        <motion.div 
          className="w-full grid grid-cols-2 gap-2 mb-4 z-20 shrink-0"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatCard title="УЧЁБА" value="8.2" percentage={82} colorHex="#3b82f6" colorClass="text-blue-500" Icon={BookOpen} />
          <StatCard title="УВАЖЕНИЕ" value="7.5" percentage={75} colorHex="#a855f7" colorClass="text-purple-500" Icon={Handshake} />
          <StatCard title="ФОКУС" value="6.8" percentage={68} colorHex="#06b6d4" colorClass="text-cyan-500" Icon={Target} />
          <StatCard title="ДОМ" value="9.0" percentage={90} colorHex="#10b981" colorClass="text-emerald-500" Icon={Home} />
        </motion.div>

        {/* Bottom Chests */}
        <motion.div 
          className="w-full grid grid-cols-2 gap-3 z-20 mt-auto shrink-0 pb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Reward Chest */}
          <div className="flex flex-col items-center justify-end">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer mb-0 relative w-full flex justify-center z-10"
            >
              <img src={sundukImage} alt="Rewards" className="w-[85%] h-auto object-contain drop-shadow-[0_0_25px_rgba(250,204,21,0.2)]" />
            </motion.div>
            <div className="text-center w-full -mt-4 relative z-20 pointer-events-none">
              <div className="text-[#facc15] font-montserrat font-bold text-[12px] uppercase tracking-wider mb-0.5" style={{ textShadow: '0 0 10px rgba(250,204,21,0.5)' }}>НАГРАДЫ</div>
              <div className="text-[#facc15]/70 font-nunito text-[10px] sm:text-[11px] mb-1">2 дня до открытия</div>
              <div className="w-[85%] h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-[#facc15] w-[60%] rounded-full shadow-[0_0_8px_rgba(250,204,21,0.8)]"></div>
              </div>
            </div>
          </div>

          {/* Consequences Chest */}
          <div className="flex flex-col items-center justify-end opacity-80">
            <div className="mb-0 relative w-full flex justify-center z-10">
              <img src={dangerImage} alt="Consequences" className="w-[85%] h-auto object-contain drop-shadow-[0_0_15px_rgba(239,68,68,0.2)]" />
            </div>
            <div className="text-center w-full -mt-4 relative z-20 pointer-events-none">
              <div className="text-gray-400 font-montserrat font-bold text-[12px] uppercase tracking-wider mb-0.5">ПОСЛЕДСТВИЯ</div>
              <div className="text-gray-500 font-nunito text-[10px] sm:text-[11px] mb-1">закрыто</div>
              <div className="w-[85%] h-1 bg-white/10 rounded-full mx-auto"></div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
