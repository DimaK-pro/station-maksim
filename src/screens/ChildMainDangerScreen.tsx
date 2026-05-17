import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Handshake, Target, Home, AlertTriangle, ClipboardList } from 'lucide-react';

import bgImage from '../assets/BG-min.jpg';
import headerImage from '../assets/header-screen4-min.png'; // Red header from screen 4
import stationImage from '../assets/station3-min.png'; // Station 3
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

export const ChildMainDangerScreen: React.FC = () => {
  const navigate = useNavigate();

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

      <div className="relative z-10 flex flex-col items-center w-full max-w-md mx-auto pt-4 px-4 pb-4 h-[100dvh]">
        
        {/* Header - from screen 4 (red) */}
        <motion.div 
          className="w-full z-20 shrink-0 mb-2 relative"
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

        <div className="w-full flex-1 flex flex-col items-center justify-center z-10 min-h-0 pointer-events-none mb-4 mt-6">
          <div className="relative w-[110%] sm:w-[100%] flex flex-col items-center justify-center">
            {/* Station 3 */}
            <motion.div 
              className="w-full flex items-center justify-center z-10"
              animate={{ y: [-2, 2, -2], rotate: [-0.6, 0.6, -0.6] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            >
              <img src={stationImage} alt="Station Danger" className="w-full h-auto object-contain drop-shadow-[0_0_30px_rgba(239,68,68,0.25)]" />
            </motion.div>

            {/* Energy: 2 yellow divisions, but keep the plate color original blue/cyan */}
            <div className="w-[35%] sm:w-[30%] relative flex items-center justify-center z-20 shrink-0 -mt-[3%] sm:-mt-[2%]">
              <img 
                src={energyImage} 
                alt="Energy" 
                className="w-full h-auto object-contain drop-shadow-[0_0_15px_rgba(0,255,255,0.3)]" 
              />
              <div className="absolute flex items-center justify-center gap-1 pl-1">
                <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                <span className="font-montserrat font-black text-3xl sm:text-4xl text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] tracking-wider">
                  +8
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Lowered, colors shifting to orange/red */}
        <motion.div 
          className="w-full grid grid-cols-2 gap-2 mb-4 z-20 shrink-0"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatCard title="УЧЁБА" value="4.6" percentage={46} colorHex="#f97316" colorClass="text-orange-500" Icon={BookOpen} />
          <StatCard title="УВАЖЕНИЕ" value="3.9" percentage={39} colorHex="#f43f5e" colorClass="text-rose-500" Icon={Handshake} />
          <StatCard title="ФОКУС" value="4.8" percentage={48} colorHex="#ef4444" colorClass="text-red-500" Icon={Target} />
          <StatCard title="ДОМ" value="3.5" percentage={35} colorHex="#ea580c" colorClass="text-orange-600" Icon={Home} />
        </motion.div>

        {/* Bottom Chests - Consequences Active */}
        <motion.div 
          className="w-full grid grid-cols-2 gap-3 z-20 mt-auto shrink-0 pb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Reward Chest - Inactive */}
          <div className="flex flex-col items-center justify-end opacity-50 grayscale-[50%]">
            <div className="mb-0 relative w-full flex justify-center z-10">
              <img src={sundukImage} alt="Rewards" className="w-[85%] h-auto object-contain" />
            </div>
            <div className="text-center w-full -mt-4 relative z-20 pointer-events-none">
              <div className="text-gray-400 font-montserrat font-bold text-[12px] uppercase tracking-wider mb-0.5">НАГРАДЫ</div>
              <div className="text-gray-500 font-nunito text-[10px] sm:text-[11px] mb-1">заморожено</div>
              <div className="w-[85%] h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gray-500 w-[20%] rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Consequences Chest - Active */}
          <div className="flex flex-col items-center justify-end">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer mb-0 relative w-full flex justify-center z-10"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            >
              <img src={dangerImage} alt="Consequences" className="w-[85%] h-auto object-contain drop-shadow-[0_0_25px_rgba(249,115,22,0.4)]" />
            </motion.div>
            <div className="text-center w-full -mt-4 relative z-20 pointer-events-none">
              <div className="text-orange-500 font-montserrat font-bold text-[12px] uppercase tracking-wider mb-0.5" style={{ textShadow: '0 0 10px rgba(249,115,22,0.6)' }}>ПОСЛЕДСТВИЯ</div>
              <div className="text-orange-400 font-nunito text-[10px] sm:text-[11px] mb-1">ТРЕБУЕТ ВНИМАНИЯ</div>
              <div className="w-[85%] h-1 bg-white/10 rounded-full mx-auto">
                <motion.div 
                  className="h-full bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                  initial={{ width: "80%" }}
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                ></motion.div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
