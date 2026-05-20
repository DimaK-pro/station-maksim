import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';

import sundukImage from '../assets/sunduk1-min.png';
import dangerImage from '../assets/danger1-min.png';

type ChestState = {
  status: 'locked' | 'countdown' | 'available' | 'completed';
  daysLeft: number | null;
  level: number | null;
  progress: number;
  maxProgress: number;
  progressType?: 'energy' | 'days' | 'complete';
  requiredDays?: number | null;
  energyRequired?: number | null;
  energyLeft?: number | null;
};

function getProgressWidth(chest?: ChestState): string {
  if (!chest || chest.maxProgress <= 0) return '0%';
  const value = Math.max(0, Math.min(100, (chest.progress / chest.maxProgress) * 100));
  return `${value}%`;
}

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0';
  return String(Math.abs(Math.round(value)));
}

function formatDaysLeft(days: number | null | undefined): string {
  const value = Math.max(0, Math.round(days ?? 0));
  if (value === 0) return 'СЕГОДНЯ';
  if (value === 1) return 'ЧЕРЕЗ 1 ДЕНЬ';
  if (value >= 2 && value <= 4) return `ЧЕРЕЗ ${value} ДНЯ`;
  return `ЧЕРЕЗ ${value} ДНЕЙ`;
}

function formatLevel(chest: ChestState): number {
  return chest.level ?? 1;
}

function getRewardText(chest: ChestState | undefined): string {
  if (!chest) return 'НАГРАДЫ ГОТОВЯТСЯ';
  if (chest.status === 'available') return `УР.${formatLevel(chest)}: НАГРАДА ГОТОВА`;
  if (chest.status === 'countdown') return `УР.${formatLevel(chest)}: ОТКРОЕТСЯ ${formatDaysLeft(chest.daysLeft)}`;
  if (chest.status === 'completed') return 'ВСЕ НАГРАДЫ ПОЛУЧЕНЫ';
  return `УР.${formatLevel(chest)}: НУЖНО ${formatNumber(chest.energyRequired ?? 50)} ЭНЕРГИИ`;
}

function getConsequenceText(chest: ChestState | undefined): string {
  if (!chest) return 'ПОСЛЕДСТВИЯ ГОТОВЯТСЯ';
  if (chest.status === 'available') return `УР.${formatLevel(chest)}: НАСТУПИЛИ ПОСЛЕДСТВИЯ`;
  if (chest.status === 'countdown') return `УР.${formatLevel(chest)}: ПОСЛЕДСТВИЯ ${formatDaysLeft(chest.daysLeft)}`;
  if (chest.status === 'completed') return 'ВСЕ УРОВНИ ПРОЙДЕНЫ';
  return `УР.${formatLevel(chest)}: ОСТЕРЕГАЙСЯ -${formatNumber(chest.energyRequired ?? -50)} ЭНЕРГИИ`;
}

function getProgressText(chest: ChestState | undefined): string {
  if (!chest || chest.status === 'completed') return '';
  if (chest.progressType === 'energy' || chest.status === 'locked') {
    return `ЭНЕРГИЯ ${Math.round(chest.progress)}/${Math.round(chest.maxProgress)}`;
  }
  if (chest.requiredDays === 0) return 'БЕЗ ОЖИДАНИЯ';
  return `ДНИ ${Math.round(chest.progress)}/${Math.round(chest.maxProgress)}`;
}

export const StationChests: React.FC = () => {
  const navigate = useNavigate();
  const { chestStatus } = useAppStore();
  const reward = chestStatus?.reward;
  const consequence = chestStatus?.consequence;
  const rewardAvailable = reward?.status === 'available';
  const consequenceAvailable = consequence?.status === 'available';

  return (
    <motion.div
      className="station-chests grid grid-cols-2 gap-2 z-20 shrink-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="flex flex-col items-center justify-end">
        <motion.div
          animate={rewardAvailable ? { scale: [1, 1.045, 1], y: [0, -4, 0] } : { scale: 1, y: 0 }}
          transition={rewardAvailable ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : undefined}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => rewardAvailable && navigate('/drum')}
          className={`cursor-pointer -mb-1 relative w-full flex justify-center z-10 ${!rewardAvailable && 'opacity-80'}`}
        >
          {rewardAvailable && (
            <motion.div
              className="absolute inset-x-[6%] top-[10%] bottom-[8%] rounded-[32px] bg-[#facc15]/25 blur-xl"
              animate={{ opacity: [0.45, 0.95, 0.45] }}
              transition={{ duration: 1.25, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <img
            src={sundukImage}
            alt="Rewards"
            className={`relative z-10 w-[72%] sm:w-[78%] h-auto object-contain transition-all ${
              rewardAvailable
                ? 'drop-shadow-[0_0_34px_rgba(250,204,21,0.95)] brightness-110'
                : 'drop-shadow-[0_0_25px_rgba(250,204,21,0.2)]'
            }`}
          />
        </motion.div>
        <div className="text-center w-full -mt-3 relative z-20 pointer-events-none">
          <div className="text-[#facc15] font-montserrat font-bold text-[11px] sm:text-[12px] uppercase tracking-wider mb-0.5" style={{ textShadow: '0 0 10px rgba(250,204,21,0.5)' }}>НАГРАДЫ</div>
          <div className="text-[#facc15]/70 font-nunito text-[9px] sm:text-[11px] leading-tight mb-0.5">
            {getRewardText(reward)}
          </div>
          <div className="text-[#facc15]/45 font-montserrat text-[8px] sm:text-[9px] uppercase tracking-wider mb-0.5 min-h-[10px]">
            {getProgressText(reward)}
          </div>
          <div className="w-[78%] h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
            <motion.div
              className="h-full bg-[#facc15] rounded-full shadow-[0_0_8px_rgba(250,204,21,0.8)]"
              animate={rewardAvailable ? { opacity: [0.75, 1, 0.75] } : undefined}
              transition={rewardAvailable ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" } : undefined}
              style={{ width: getProgressWidth(reward) }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-end opacity-80">
        <motion.div
          animate={consequenceAvailable ? { scale: [1, 1.05, 1], y: [0, -4, 0] } : { scale: 1, y: 0 }}
          transition={consequenceAvailable ? { duration: 1.45, repeat: Infinity, ease: "easeInOut" } : undefined}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => consequenceAvailable && navigate('/drum-danger')}
          className={`cursor-pointer -mb-1 relative w-full flex justify-center z-10 ${!consequenceAvailable && 'opacity-80'}`}
        >
          {consequenceAvailable && (
            <motion.div
              className="absolute inset-x-[7%] top-[8%] bottom-[8%] rounded-[32px] bg-[#f43f5e]/35 blur-xl"
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 0.95, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <img
            src={dangerImage}
            alt="Consequences"
            className={`relative z-10 w-[72%] sm:w-[78%] h-auto object-contain transition-all ${
              consequenceAvailable
                ? 'drop-shadow-[0_0_38px_rgba(244,63,94,1)] brightness-125 saturate-150'
                : 'drop-shadow-[0_0_15px_rgba(239,68,68,0.2)]'
            }`}
          />
        </motion.div>
        <div className="text-center w-full -mt-3 relative z-20 pointer-events-none">
          <div className="text-[#f43f5e] font-montserrat font-bold text-[11px] sm:text-[12px] uppercase tracking-wider mb-0.5" style={{ textShadow: '0 0 10px rgba(244,63,94,0.5)' }}>ПОСЛЕДСТВИЯ</div>
          <div className="text-[#f43f5e]/70 font-nunito text-[9px] sm:text-[11px] leading-tight mb-0.5">
            {getConsequenceText(consequence)}
          </div>
          <div className="text-[#f43f5e]/45 font-montserrat text-[8px] sm:text-[9px] uppercase tracking-wider mb-0.5 min-h-[10px]">
            {getProgressText(consequence)}
          </div>
          <div className="w-[78%] h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
            <motion.div
              className="h-full bg-[#f43f5e] rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)]"
              animate={consequenceAvailable ? { opacity: [0.7, 1, 0.7] } : undefined}
              transition={consequenceAvailable ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" } : undefined}
              style={{ width: getProgressWidth(consequence) }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
