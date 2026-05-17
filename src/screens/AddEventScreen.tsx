import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { cn } from '../utils/cn';
import { BookOpen, Handshake, Target, Home, ThumbsUp, Minus, ThumbsDown, Leaf, AlertTriangle, Star, Zap, Terminal, Send, LogOut, ChevronLeft, Info, Package, Settings, User } from 'lucide-react';
import bgImage from '../assets/BG-min.jpg';

export const AddEventScreen: React.FC = () => {
  const { addEvent, events } = useAppStore();
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'papa';
  const roleDisplay = role === 'mama' ? 'МАМА' : role === 'babushka' ? 'БАБУШКА' : 'ПАПА';
  
  const [sphereId, setSphereId] = useState<string | null>(null);
  const [type, setType] = useState<'good' | 'neutral' | 'bad' | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  const isTypeActive = sphereId !== null;
  const isPointsActive = sphereId !== null && type !== null;
  const isReady = sphereId !== null && type !== null && points !== null;

  const handleSubmit = () => {
    if (isReady) {
      addEvent({
        sphereId,
        title: type === 'good' ? 'Позитивное событие' : type === 'bad' ? 'Негативное событие' : 'Событие',
        comment: comment || 'Без комментария',
        author: roleDisplay as any,
        points,
      });
      navigate('/log');
    }
  };

  const getPointsOptions = () => {
    if (type === 'bad') return [-5, -10, -20, -30, -50];
    if (type === 'neutral') return [-2, -1, 0, 1, 2];
    return [5, 10, 20, 30, 50];
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-[#070b14] overflow-x-hidden font-nunito pb-12">
      {/* Deep Space Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center" 
        style={{backgroundImage: `url(${bgImage})`}}
      ></div>
      
      {/* TopAppBar */}
      <header className="sticky top-0 z-40 bg-[#070b14]/80 backdrop-blur-xl border border-white/10 mx-4 mt-4 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex justify-between items-center px-4 py-3 max-w-md md:mx-auto transition-all duration-300 w-[calc(100%-2rem)] rounded-2xl">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/log')}
            className="p-2 glass-panel rounded-lg text-white/80 border border-white/10 hover:bg-white/10"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex flex-col">
            <span className="font-montserrat text-[10px] font-bold text-cyan-400 tracking-[0.2em] uppercase">{roleDisplay}</span>
            <span className="text-white/60 text-[10px] tracking-widest uppercase">Доступ</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/admin/chests')} className="flex items-center justify-center w-9 h-9 glass-panel rounded-full border border-white/10 hover:bg-white/10 transition-all text-white/80 hover:text-white">
            <Package size={16} />
          </button>
          {role === 'papa' && (
            <button onClick={() => navigate('/admin/settings')} className="flex items-center justify-center w-9 h-9 glass-panel rounded-full border border-white/10 hover:bg-white/10 transition-all text-white/80 hover:text-white">
              <Settings size={16} />
            </button>
          )}
          <button onClick={() => navigate('/')} className="flex items-center justify-center w-9 h-9 glass-panel rounded-full border border-white/10 hover:bg-red-500/20 hover:border-red-500/40 transition-all text-white/50 hover:text-red-400">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-6 flex flex-col gap-8 relative z-10 w-full">
        {/* Page Title */}
        <div className="text-center mt-2 mb-2">
          <h1 className="font-montserrat text-2xl font-bold text-white tracking-widest uppercase text-glow drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            ЗАПИСАТЬ СОБЫТИЕ
          </h1>
        </div>

        {/* 01 СФЕРА */}
        <section className="glass-panel p-5 flex flex-col gap-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <h2 className="font-montserrat text-[10px] font-bold text-cyan-400/60 tracking-[0.2em] uppercase flex items-center gap-2">
            <span className="w-4 h-[1px] bg-cyan-400/30"></span>
            01 Сфера
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'study', label: 'УЧЁБА', icon: BookOpen, color: 'text-blue-400' },
              { id: 'respect', label: 'УВАЖЕНИЕ', icon: Handshake, color: 'text-cyan-400' },
              { id: 'focus', label: 'ФОКУС', icon: Target, color: 'text-purple-400' },
              { id: 'family', label: 'ДОМ', icon: Home, color: 'text-emerald-400' }
            ].map(s => {
              const isActive = sphereId === s.id;
              const Icon = s.icon;
              return (
                <button 
                  key={s.id} 
                  onClick={() => setSphereId(s.id)}
                  className={cn(
                    "h-14 flex items-center justify-center gap-2 px-4 transition-all group rounded-xl relative overflow-hidden",
                    isActive 
                      ? "bg-cyan-500/20 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-2 relative z-10">
                    <Icon className={cn("w-4 h-4", isActive ? "text-cyan-400" : `${s.color} opacity-80`)} />
                    <span className={cn("font-montserrat uppercase tracking-widest font-bold text-[10px]", isActive ? "text-cyan-400" : "text-white/70 group-hover:text-white")}>{s.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 02 ТИП СОБЫТИЯ */}
        <section className={cn("glass-panel p-5 flex flex-col gap-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500", !isTypeActive && "opacity-40 pointer-events-none grayscale-[50%]")}>
          <h2 className="font-montserrat text-[10px] font-bold text-cyan-400/60 tracking-[0.2em] uppercase flex items-center gap-2">
            <span className="w-4 h-[1px] bg-cyan-400/30"></span>
            02 Тип события
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => { setType('good'); setPoints(null); }}
              className={cn("h-16 flex flex-col items-center justify-center gap-1.5 relative overflow-hidden rounded-xl transition-all",
                type === 'good' ? "bg-emerald-500/20 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-white/5 border border-white/10 hover:bg-white/10"
              )}
            >
              <ThumbsUp className={cn("w-5 h-5", type === 'good' ? "text-emerald-400" : "text-white/50")} />
              <span className={cn("font-montserrat uppercase tracking-widest font-bold text-[9px]", type === 'good' ? "text-emerald-400" : "text-white/50")}>ХОРОШЕЕ</span>
            </button>
            <button 
              onClick={() => { setType('neutral'); setPoints(null); }}
              className={cn("h-16 flex flex-col items-center justify-center gap-1.5 relative overflow-hidden rounded-xl transition-all",
                type === 'neutral' ? "bg-white/20 border border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "bg-white/5 border border-white/10 hover:bg-white/10"
              )}
            >
              <Minus className={cn("w-5 h-5", type === 'neutral' ? "text-white" : "text-white/50")} />
              <span className={cn("font-montserrat uppercase tracking-widest font-bold text-[9px]", type === 'neutral' ? "text-white" : "text-white/50")}>НЕЙТРАЛЬНОЕ</span>
            </button>
            <button 
              onClick={() => { setType('bad'); setPoints(null); }}
              className={cn("h-16 flex flex-col items-center justify-center gap-1.5 relative overflow-hidden rounded-xl transition-all",
                type === 'bad' ? "bg-red-500/20 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "bg-white/5 border border-white/10 hover:bg-white/10"
              )}
            >
              <ThumbsDown className={cn("w-5 h-5", type === 'bad' ? "text-red-400" : "text-white/50")} />
              <span className={cn("font-montserrat uppercase tracking-widest font-bold text-[9px]", type === 'bad' ? "text-red-400" : "text-white/50")}>ПЛОХОЕ</span>
            </button>
          </div>
        </section>

        {/* 03 СИЛА */}
        <section className={cn("glass-panel p-5 flex flex-col gap-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500", !isPointsActive && "opacity-40 pointer-events-none grayscale-[50%]")}>
            <h2 className="font-montserrat text-[10px] font-bold text-cyan-400/60 tracking-[0.2em] uppercase flex items-center gap-2">
              <span className="w-4 h-[1px] bg-cyan-400/30"></span>
              03 Сила
            </h2>
            <div className="flex justify-between items-center gap-2">
              {getPointsOptions().map(w => {
                const isActive = points === w;
                let Icon = Leaf;
                let colorClass = 'text-lime-400';
                
                const absW = Math.abs(w);
                if (type === 'bad') {
                  if (absW === 2) { Icon = Leaf; colorClass = 'text-lime-400'; }
                  if (absW === 5) { Icon = ThumbsDown; colorClass = 'text-yellow-400'; }
                  if (absW === 10) { Icon = AlertTriangle; colorClass = 'text-orange-400'; }
                  if (absW === 18) { Icon = AlertTriangle; colorClass = 'text-red-400'; }
                  if (absW === 30) { Icon = Zap; colorClass = 'text-red-600'; }
                } else if (type === 'good') {
                  if (absW === 2) { Icon = Leaf; colorClass = 'text-cyan-300'; }
                  if (absW === 5) { Icon = ThumbsUp; colorClass = 'text-cyan-500'; }
                  if (absW === 10) { Icon = Star; colorClass = 'text-emerald-400'; }
                  if (absW === 18) { Icon = Star; colorClass = 'text-green-500'; }
                  if (absW === 30) { Icon = Zap; colorClass = 'text-emerald-500'; }
                } else {
                  Icon = Minus;
                  colorClass = 'text-zinc-400';
                }

                const baseClasses = "w-[64px] h-[64px] flex flex-col items-center justify-center rounded-[1.25rem] transition-all border";

                if (isActive) {
                  return (
                    <button key={w} className={cn(baseClasses, "bg-white/10 border-white/30 shadow-inner transform scale-105 z-10")}>
                      <Icon className={cn("w-5 h-5", colorClass)} />
                      <span className={cn("font-montserrat text-sm font-bold mt-1", colorClass)}>{w > 0 ? `+${w}` : w}</span>
                    </button>
                  );
                }

                return (
                  <button 
                    key={w} 
                    onClick={() => setPoints(w)}
                    className={cn(baseClasses, "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10")}
                  >
                    <Icon className={cn("w-5 h-5 opacity-70", colorClass)} />
                    <span className={cn("font-montserrat text-sm font-bold mt-1 opacity-70", colorClass)}>{w > 0 ? `+${w}` : w}</span>
                  </button>
                );
              })}
            </div>
            
            {points !== null && (
              <div className="mt-2 bg-white/5 p-3 border border-white/10 relative rounded-xl backdrop-blur-sm">
                <p className="font-nunito text-sm text-white/80 relative z-10 flex items-start gap-2">
                  <Info className="text-cyan-400 w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-cyan-400 font-bold">{points > 0 ? `+${points}` : points} баллов</strong> — {type === 'good' ? 'хороший поступок, заметный вклад в энергию станции' : type === 'bad' ? 'нарушение, забирающее энергию' : 'событие без оценки'}
                  </span>
                </p>
              </div>
            )}
          </section>

        {/* 04 КОММЕНТАРИЙ */}
        <section className="glass-panel p-5 flex flex-col gap-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <h2 className="font-montserrat text-[10px] font-bold text-cyan-400/60 tracking-[0.2em] uppercase flex items-center gap-2">
            <span className="w-4 h-[1px] bg-cyan-400/30"></span>
            04 Комментарий
          </h2>
          <div className="relative">
            <div className="absolute top-4 left-4 flex items-center justify-center pointer-events-none z-20">
              <Terminal className="text-white/40 w-5 h-5" />
            </div>
            <textarea 
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={140}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 pl-12 pr-4 py-4 resize-none h-[100px] rounded-xl relative z-10 font-nunito" 
              placeholder="Введите данные журнала..."
            ></textarea>
            <div className="absolute bottom-3 right-4 font-montserrat text-[10px] text-white/40 font-bold z-20">
              {comment.length}/140
            </div>
          </div>
        </section>

        {/* Submit Action */}
        <div className="mt-2 pb-8">
          <button 
            disabled={!isReady}
            onClick={handleSubmit}
            className={cn(
              "w-full h-16 px-6 flex items-center justify-center gap-3 relative overflow-hidden transition-all duration-300 rounded-2xl border",
              isReady 
                ? "bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:bg-cyan-500/30" 
                : "bg-white/5 border-white/10 opacity-50 cursor-not-allowed grayscale"
            )}
          >
            {isReady && <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>}
            <span className={cn("font-montserrat uppercase tracking-widest font-bold relative z-10 text-sm", isReady ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "text-white/50")}>
              ОТПРАВИТЬ СИГНАЛ
            </span>
            <Send className={cn("relative z-10 w-5 h-5", isReady ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "text-white/50")} />
          </button>
          
          {events.length > 0 && (
            <div className="text-center mt-6 flex items-center justify-center gap-2 text-white/40 font-nunito text-xs">
              <div className="w-4 h-4 rounded-full overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center">
                <User size={10} className="text-white/60" />
              </div>
              <span>{events[events.length-1].author} • {new Date(events[events.length-1].timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
