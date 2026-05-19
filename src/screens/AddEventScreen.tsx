import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { cn } from '../utils/cn';
import { BookOpen, Handshake, Target, Home, ThumbsUp, Minus, ThumbsDown, Leaf, AlertTriangle, Star, Zap, Terminal, Send, LogOut, ChevronLeft, Info, Package, Settings, User, Rocket, Flame, Siren } from 'lucide-react';
import { getEventTitle } from '../utils/eventTitles';
import bgImage from '../assets/BG-min.jpg';

export const AddEventScreen: React.FC = () => {
  const { addEvent, events, weightsGood, weightsNeutral, weightsBad } = useAppStore();
  const navigate = useNavigate();
  const role = localStorage.getItem('station_role') || 'papa';
  const roleDisplay = role === 'mama' ? 'МАМА' : role === 'babushka' ? 'БАБУШКА' : 'ПАПА';
  
  const [sphereId, setSphereId] = useState<string | null>(null);
  
  React.useEffect(() => {
    if (!localStorage.getItem('station_token')) {
      navigate('/admin');
    }
  }, [navigate]);
  const [type, setType] = useState<'good' | 'neutral' | 'bad' | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isTypeActive = sphereId !== null;
  const isPointsActive = sphereId !== null && type !== null;
  const isReady = sphereId !== null && type !== null && points !== null;

  const handleSubmit = async () => {
    if (isReady) {
      setSubmitError(null);
      const saved = await addEvent({
        sphereId,
        title: getEventTitle(type, points),
        comment: comment || 'Без комментария',
        author: roleDisplay as any,
        points,
      });
      if (saved) {
        navigate('/log');
      } else {
        setSubmitError('Не удалось сохранить событие. Проверьте подключение и попробуйте еще раз.');
      }
    }
  };

  const getPointsOptions = () => {
    if (type === 'bad') return weightsBad;
    if (type === 'neutral') return weightsNeutral;
    return weightsGood;
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
          <button onClick={() => {
            localStorage.removeItem('station_token');
            localStorage.removeItem('station_role');
            navigate('/admin');
          }} className="flex items-center justify-center w-9 h-9 glass-panel rounded-full border border-white/10 hover:bg-red-500/20 hover:border-red-500/40 transition-all text-white/50 hover:text-red-400">
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
              { id: 'home', label: 'СЕМЬЯ', icon: Home, color: 'text-emerald-400' }
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
              {getPointsOptions().map((w, index) => {
                const isActive = points === w;
                let Icon = Leaf;
                let colorClass = 'text-slate-300';
                let activeClass = 'bg-white/10 border-white/30 shadow-inner';
                let inactiveClass = 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10';

                if (type === 'bad') {
                  const badVisuals = [
                    { Icon: AlertTriangle, colorClass: 'text-yellow-300', activeClass: 'bg-yellow-400/15 border-yellow-300/50 shadow-[0_0_18px_rgba(250,204,21,0.2)]' },
                    { Icon: ThumbsDown, colorClass: 'text-amber-400', activeClass: 'bg-amber-500/15 border-amber-400/50 shadow-[0_0_18px_rgba(245,158,11,0.22)]' },
                    { Icon: Flame, colorClass: 'text-orange-500', activeClass: 'bg-orange-500/15 border-orange-500/50 shadow-[0_0_18px_rgba(249,115,22,0.25)]' },
                    { Icon: Zap, colorClass: 'text-red-500', activeClass: 'bg-red-500/15 border-red-500/50 shadow-[0_0_18px_rgba(239,68,68,0.28)]' },
                    { Icon: Siren, colorClass: 'text-red-600', activeClass: 'bg-red-600/20 border-red-500/60 shadow-[0_0_22px_rgba(220,38,38,0.35)]' },
                  ];
                  const visual = badVisuals[index] || badVisuals[badVisuals.length - 1];
                  Icon = visual.Icon;
                  colorClass = visual.colorClass;
                  activeClass = visual.activeClass;
                  inactiveClass = 'bg-red-950/10 border-white/5 hover:bg-red-500/10 hover:border-red-400/20';
                } else if (type === 'good') {
                  const goodVisuals = [
                    { Icon: Leaf, colorClass: 'text-cyan-300', activeClass: 'bg-cyan-400/15 border-cyan-300/50 shadow-[0_0_18px_rgba(103,232,249,0.2)]' },
                    { Icon: ThumbsUp, colorClass: 'text-teal-300', activeClass: 'bg-teal-400/15 border-teal-300/50 shadow-[0_0_18px_rgba(94,234,212,0.22)]' },
                    { Icon: Star, colorClass: 'text-emerald-400', activeClass: 'bg-emerald-400/15 border-emerald-400/50 shadow-[0_0_18px_rgba(52,211,153,0.25)]' },
                    { Icon: Zap, colorClass: 'text-green-400', activeClass: 'bg-green-500/15 border-green-400/50 shadow-[0_0_18px_rgba(74,222,128,0.28)]' },
                    { Icon: Rocket, colorClass: 'text-lime-300', activeClass: 'bg-lime-400/15 border-lime-300/60 shadow-[0_0_22px_rgba(190,242,100,0.35)]' },
                  ];
                  const visual = goodVisuals[index] || goodVisuals[goodVisuals.length - 1];
                  Icon = visual.Icon;
                  colorClass = visual.colorClass;
                  activeClass = visual.activeClass;
                  inactiveClass = 'bg-cyan-950/10 border-white/5 hover:bg-emerald-500/10 hover:border-emerald-400/20';
                } else {
                  Icon = Minus;
                  colorClass = 'text-zinc-400';
                }

                const baseClasses = "w-[64px] h-[64px] flex flex-col items-center justify-center rounded-[1.25rem] transition-all border";

                if (isActive) {
                  return (
                    <button key={w} className={cn(baseClasses, activeClass, "transform scale-105 z-10")}>
                      <Icon className={cn("w-5 h-5", colorClass)} />
                      <span className={cn("font-montserrat text-sm font-bold mt-1", colorClass)}>{w > 0 ? `+${w}` : w}</span>
                    </button>
                  );
                }

                return (
                  <button 
                    key={w} 
                    onClick={() => setPoints(w)}
                    className={cn(baseClasses, inactiveClass)}
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
          {submitError && (
            <div className="mb-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-center text-sm font-nunito">
              {submitError}
            </div>
          )}
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
