import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { cn } from '../utils/cn';
import { ChevronLeft, Clock, Plus, Trash2, List, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import bgImage from '../assets/BG-min.jpg';
import { api } from '../api';

const MONTH_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function formatLogDateTime(value: string): string {
  const date = new Date(value);
  const day = date.getDate();
  const month = MONTH_SHORT[date.getMonth()] ?? '';
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${day} ${month} / ${time}`;
}

export const MissionLogScreen: React.FC = () => {
  const { events, spheres, deleteEvent } = useAppStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'events' | 'rewards'>('events');
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [spins, setSpins] = useState<any[]>([]);
  const [isLoadingSpins, setIsLoadingSpins] = useState(false);

  useEffect(() => {
    if (activeTab === 'rewards') {
      const fetchSpins = async () => {
        setIsLoadingSpins(true);
        try {
          const fetchedSpins = await api.getEvents('spins');
          setSpins(fetchedSpins);
        } catch (e) {
          console.error('Failed to fetch spins', e);
        } finally {
          setIsLoadingSpins(false);
        }
      };
      fetchSpins();
    }
  }, [activeTab]);

  const role = localStorage.getItem('station_role');

  const visibleEvents = events.filter(e => !deletedIds.includes(e.id));
  const now = new Date();
  const today = visibleEvents.filter(e => isSameDay(new Date(e.timestamp), now));
  const older = visibleEvents.filter(e => !isSameDay(new Date(e.timestamp), now));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const EventCard = ({ event }: { event: any }) => {
    const sphere = spheres.find(s => s.id === event.sphereId);
    const isPositive = event.points > 0;
    
    // Assign glow colors based on author
    const authorColor = event.author === 'Папа' ? 'text-blue-400 bg-blue-400' : 
                        event.author === 'Мама' ? 'text-pink-400 bg-pink-400' : 
                        'text-emerald-400 bg-emerald-400';
    
    return (
      <motion.div variants={itemVariants} className="relative pl-6 mb-4">
        {/* Timeline Line */}
        <div className="absolute left-[11px] top-8 bottom-[-16px] w-[2px] bg-white/10 last:bg-transparent"></div>
        
        {/* Timeline Node */}
        <div className={cn(
          "absolute left-0 top-3 w-6 h-6 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm z-10",
          isPositive ? "bg-[#22d3ee]/20 shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full",
            isPositive ? "bg-[#22d3ee]" : "bg-red-400"
          )}></div>
        </div>
        
        <div 
          className="glass-panel p-4 flex gap-4 rounded-2xl border border-white/10 relative overflow-hidden"
          style={{
            boxShadow: isPositive ? '0 4px 20px -2px rgba(34,211,238,0.1)' : '0 4px 20px -2px rgba(239,68,68,0.1)',
          }}
        >
          {/* Subtle background glow based on points */}
          <div className={cn(
            "absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[30px] opacity-20 pointer-events-none",
            isPositive ? "bg-[#22d3ee]" : "bg-red-500"
          )}></div>

          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl shrink-0 shadow-inner z-10">
            {sphere?.emoji}
          </div>
          
          <div className="flex-1 z-10 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-montserrat font-bold text-white/80 leading-tight text-xs tracking-wide uppercase pr-3">{event.title}</h3>
              <span className={cn(
                "font-montserrat font-black text-xl leading-none drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] shrink-0",
                isPositive ? "text-[#22d3ee]" : "text-red-400"
              )}>
                {event.points > 0 ? '+' : ''}{event.points}
              </span>
            </div>
            
            <p className="text-white/75 font-nunito text-base leading-snug pr-1">{event.comment}</p>
            
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10 text-[10px] sm:text-xs text-white/40 font-montserrat">
              <div className="flex items-center gap-1.5">
                <span className={cn("w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]", authorColor)}></span>
                <span className="uppercase tracking-widest font-bold text-white/60">{event.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 font-nunito font-semibold">
                  <Clock size={12} className="opacity-70" />
                  <span>{formatLogDateTime(event.timestamp)}</span>
                </div>
                {role && (
                  <button 
                    onClick={() => setEventToDelete(event.id)}
                    className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    aria-label="Удалить событие"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const SpinCard = ({ spin }: { spin: any }) => {
    const isReward = spin.chestType === 'reward';
    const item = spin.chestItem;
    if (!item) return null;

    return (
      <motion.div variants={itemVariants} className="relative pl-6 mb-4">
        {/* Timeline Line */}
        <div className="absolute left-[11px] top-8 bottom-[-16px] w-[2px] bg-white/10 last:bg-transparent"></div>
        
        {/* Timeline Node */}
        <div className={cn(
          "absolute left-0 top-3 w-6 h-6 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm z-10",
          isReward ? "bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full",
            isReward ? "bg-amber-400" : "bg-purple-400"
          )}></div>
        </div>
        
        <div 
          className="glass-panel p-4 flex gap-4 rounded-2xl border border-white/10 relative overflow-hidden"
          style={{
            boxShadow: isReward ? '0 4px 20px -2px rgba(245,158,11,0.1)' : '0 4px 20px -2px rgba(168,85,247,0.1)',
          }}
        >
          <div className={cn(
            "absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[30px] opacity-20 pointer-events-none",
            isReward ? "bg-amber-400" : "bg-purple-500"
          )}></div>

          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl shrink-0 shadow-inner z-10">
            {item.icon}
          </div>
          
          <div className="flex-1 z-10 flex flex-col justify-center">
            <h3 className="font-montserrat font-bold text-white/90 leading-tight text-sm tracking-wide mb-1">{item.title}</h3>
            
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10 text-[10px] sm:text-xs text-white/40 font-montserrat">
              <div className="flex items-center gap-1.5 uppercase tracking-widest font-bold text-white/60">
                {isReward ? 'Награда' : 'Последствие'} • Ур. {item.level}
              </div>
              <div className="flex items-center gap-1 font-nunito font-semibold">
                <Clock size={12} className="opacity-70" />
                <span>{formatLogDateTime(spin.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-[#070b14] overflow-hidden">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center" 
        style={{backgroundImage: `url(${bgImage})`}}
      ></div>

      <div className="relative z-10 flex flex-col flex-1 w-full max-w-md mx-auto h-[100dvh]">
        {/* Header */}
        <header className="flex items-center gap-4 px-4 pt-6 pb-4 shrink-0">
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')} 
            className="p-3 glass-panel rounded-xl text-white/80 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            <ChevronLeft size={20} />
          </motion.button>
          <div className="flex-1">
            <h1 className="font-montserrat font-bold text-lg sm:text-xl text-white/90 tracking-widest uppercase text-glow">
              Журнал событий
            </h1>
            <p className="text-[10px] sm:text-xs font-nunito text-cyan-400/60 uppercase tracking-[0.2em] mt-0.5">
              Система логирования
            </p>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex px-4 mb-4 border-b border-white/10 shrink-0">
          <button 
            onClick={() => setActiveTab('events')}
            className={cn(
              "flex-1 pb-3 text-[10px] sm:text-xs font-montserrat font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5",
              activeTab === 'events' ? "text-cyan-400 border-b-2 border-cyan-400" : "text-white/40 hover:text-white/60"
            )}
          >
            <List size={14} /> СОБЫТИЯ
          </button>
          <button 
            onClick={() => setActiveTab('rewards')}
            className={cn(
              "flex-1 pb-3 text-[10px] sm:text-xs font-montserrat font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5",
              activeTab === 'rewards' ? "text-cyan-400 border-b-2 border-cyan-400" : "text-white/40 hover:text-white/60"
            )}
          >
            <Gift size={14} /> НАГРАДЫ И ПОСЛЕДСТВИЯ
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-28">
          <AnimatePresence mode="wait">
            {activeTab === 'events' ? (
              <motion.div 
                key="events-tab"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                variants={containerVariants} 
              >
                {today.length > 0 && (
                  <div className="mb-6 mt-2">
                    <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4">
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20"></div>
                      <span className="font-montserrat font-bold text-[10px] text-white/50 tracking-[0.2em] uppercase">СЕГОДНЯ</span>
                      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20"></div>
                    </motion.div>
                    <AnimatePresence>
                      {today.map(e => <EventCard key={e.id} event={e} />)}
                    </AnimatePresence>
                  </div>
                )}
                
                {older.length > 0 && (
                  <div>
                    <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4">
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20"></div>
                      <span className="font-montserrat font-bold text-[10px] text-white/50 tracking-[0.2em] uppercase">ВЧЕРА</span>
                      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20"></div>
                    </motion.div>
                    <AnimatePresence>
                      {older.map(e => <EventCard key={e.id} event={e} />)}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="rewards-tab"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                variants={containerVariants}
              >
                {isLoadingSpins ? (
                  <div className="flex flex-col items-center justify-center h-40">
                    <div className="w-8 h-8 rounded-full border-2 border-[#22d3ee] border-t-transparent animate-spin"></div>
                  </div>
                ) : spins.length > 0 ? (
                  <div className="mb-6 mt-2">
                    <AnimatePresence>
                      {spins.map(s => <SpinCard key={s.id} spin={s} />)}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 opacity-50">
                    <span className="font-montserrat font-bold text-sm text-white/40 tracking-widest uppercase text-center">
                      Список пуст
                    </span>
                    <span className="text-xs font-nunito text-white/30 mt-2 text-center">
                      (Данные появятся позже)
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed Add Button at the bottom */}
        <div className="absolute bottom-0 left-0 w-full px-4 pb-6 pt-8 bg-gradient-to-t from-[#070b14] via-[#070b14]/80 to-transparent pointer-events-none z-20">
          <motion.button
            onClick={() => navigate('/admin')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full relative overflow-hidden rounded-2xl p-4 flex items-center justify-center gap-2 border border-[#22d3ee]/30 bg-[#22d3ee]/10 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.2)] pointer-events-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#22d3ee]/0 via-[#22d3ee]/10 to-[#22d3ee]/0 pointer-events-none"></div>
            <Plus className="w-5 h-5 text-[#22d3ee] drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="font-montserrat font-bold uppercase tracking-widest text-sm text-[#22d3ee] drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
              Добавить событие
            </span>
          </motion.button>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {eventToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#070b14]/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel p-6 rounded-3xl max-w-[320px] w-full border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
              
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 mx-auto">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              
              <h3 className="font-montserrat font-bold text-center text-white/90 text-lg mb-2">Удалить событие?</h3>
              <p className="font-nunito text-center text-white/60 text-sm mb-6">
                Это действие нельзя отменить.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setEventToDelete(null)}
                  className="flex-1 py-3 rounded-xl border border-white/10 font-montserrat font-bold text-xs tracking-widest text-white/70 uppercase hover:bg-white/5 transition-all"
                >
                  Отмена
                </button>
                <button 
                  onClick={() => {
                    setDeletedIds(prev => [...prev, eventToDelete!]);
                    deleteEvent(eventToDelete!);
                    setEventToDelete(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/40 font-montserrat font-bold text-xs tracking-widest text-red-400 uppercase hover:bg-red-500/30 transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                >
                  Удалить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
