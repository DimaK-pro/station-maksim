import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { ChevronLeft, Delete } from 'lucide-react';

import bgImage from '../assets/BG-min.jpg';

export const AdminLoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  const [pin, setPin] = useState('');

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    setPin(''); // reset pin
  };

  const handlePinInput = (num: number | string) => {
    if (num === 'del') {
      setPin(prev => prev.slice(0, -1));
    } else if (pin.length < 4 && typeof num === 'number') {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        // mock auth success
        setTimeout(() => {
          navigate('/admin/event');
        }, 300);
      }
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-[#070b14] overflow-hidden">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center" 
        style={{backgroundImage: `url(${bgImage})`}}
      ></div>

      <div className="relative z-10 flex flex-col flex-1 w-full max-w-md mx-auto h-[100dvh] px-4 pt-6 pb-6">
        
        {/* Header */}
        <header className="flex items-center gap-4 mb-8 shrink-0">
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/log')} 
            className="p-3 glass-panel rounded-xl text-white/80 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            <ChevronLeft size={20} />
          </motion.button>
          <div className="flex-1">
            <h1 className="font-montserrat font-bold text-lg sm:text-xl text-white/90 tracking-widest uppercase text-glow">
              Доступ
            </h1>
            <p className="text-[10px] sm:text-xs font-nunito text-cyan-400/60 uppercase tracking-[0.2em] mt-0.5">
              Идентификация экипажа
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-4 mb-8">
          {[
            { id: 'Папа', label: 'Главный инженер', color: 'from-blue-500/20 to-blue-900/10 border-blue-500/30 text-blue-300' },
            { id: 'Мама', label: 'Научный офицер', color: 'from-pink-500/20 to-pink-900/10 border-pink-500/30 text-pink-300' },
            { id: 'Бабушка', label: 'Старший советник', color: 'from-emerald-500/20 to-emerald-900/10 border-emerald-500/30 text-emerald-300' }
          ].map(r => (
            <motion.button
              key={r.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect(r.id)}
              className={cn(
                "p-5 rounded-2xl border bg-gradient-to-r flex items-center justify-between transition-all glass-panel relative overflow-hidden",
                r.color,
                role === r.id ? "ring-1 ring-[#22d3ee]/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "opacity-70 hover:opacity-100"
              )}
            >
              {role === r.id && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
              )}
              
              <span className="font-montserrat font-bold text-xl text-white relative z-10">{r.id}</span>
              <span className="font-nunito text-sm font-semibold tracking-wide relative z-10 opacity-80">{r.label}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {role && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="mt-auto w-full flex flex-col"
            >
              {/* Dots - outside the glass panel */}
              <div className="flex justify-center gap-6 mb-6">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-4 h-4 rounded-full transition-all duration-300",
                      pin.length > i 
                        ? "bg-[#22d3ee] shadow-[0_0_15px_rgba(34,211,238,0.8)] scale-110" 
                        : "bg-white/10 border border-white/20"
                    )}
                  />
                ))}
              </div>

              {/* Glass panel only for the keyboard */}
              <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((key, i) => (
                    <motion.button
                      key={i}
                      disabled={key === ''}
                      whileHover={key !== '' ? { scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" } : {}}
                      whileTap={key !== '' ? { scale: 0.95, backgroundColor: "rgba(255,255,255,0.15)" } : {}}
                      onClick={() => handlePinInput(key)}
                      className={cn(
                        "h-14 sm:h-16 rounded-2xl font-montserrat font-bold text-2xl flex items-center justify-center transition-colors",
                        key === '' 
                          ? "opacity-0 cursor-default" 
                          : "bg-white/5 text-white border border-white/10 shadow-inner"
                      )}
                    >
                      {key === 'del' ? <Delete className="w-6 h-6" /> : key}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
