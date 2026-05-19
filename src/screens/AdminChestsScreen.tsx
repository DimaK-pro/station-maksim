import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronLeft, Trash2, Trophy, AlertTriangle, Settings, Save, Check, Star } from 'lucide-react';
import bgImage from '../assets/BG-min.jpg';
import { cn } from '../utils/cn';

import { api } from '../api';

const REWARD_ICONS = ['🎮', '🍕', '🎬', '🧸', '🚗', '💰', '🏖️', '🎨', '🎉', '⭐'];
const CONSEQUENCE_ICONS = ['📵', '🛏️', '🧹', '📚', '🚫', '🏃', '🍽️', '😶', '📝', '⚠️'];

export const AdminChestsScreen: React.FC = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('station_role') || 'papa';
  const token = localStorage.getItem('station_token');
  
  const [type, setType] = useState<'reward' | 'consequence' | null>(null);
  const [icon, setIcon] = useState<string | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  
  React.useEffect(() => {
    if (!localStorage.getItem('station_token')) {
      navigate('/admin');
    }
  }, [navigate]);
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [chestsData, setChestsData] = useState<Record<string, Record<number, any[]>>>({});

  const fetchChests = async () => {
    try {
      const data = await api.getChests();
      const grouped: Record<string, Record<number, any[]>> = {};
      if (Array.isArray(data)) {
        for (const item of data) {
          if (!grouped[item.chestType]) grouped[item.chestType] = {};
          if (!grouped[item.chestType][item.level]) grouped[item.chestType][item.level] = [];
          grouped[item.chestType][item.level].push(item);
        }
      }
      setChestsData(grouped);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    fetchChests();
  }, []);

  const isIconActive = type !== null;
  const isLevelActive = type !== null && icon !== null;
  const isNameActive = type !== null && icon !== null && level !== null;
  const isReady = isNameActive && name.trim().length > 0;

  const currentIcons = type === 'reward' ? REWARD_ICONS : type === 'consequence' ? CONSEQUENCE_ICONS : [];

  const handleSave = async () => {
    if (isReady && token && type && icon && level) {
      try {
        await api.addChestItem(token, { chestType: type, icon, level, title: name });
        setSaved(true);
        fetchChests();
        setTimeout(() => {
          setSaved(false);
          setType(null);
          setIcon(null);
          setLevel(null);
          setName('');
        }, 2000);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await api.deleteChestItem(token, id);
      fetchChests();
    } catch (err) {
      console.error(err);
    }
  };

  const getLevelIcons = (lvl: number, t: 'reward'|'consequence') => {
    return Array(lvl).fill(0).map((_, i) => (
      t === 'reward' 
        ? <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />
        : <AlertTriangle key={i} size={10} className="fill-red-400 text-red-400" />
    ));
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-[#070b14] overflow-x-hidden font-nunito pb-12">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center" 
        style={{backgroundImage: `url(${bgImage})`}}
      ></div>
      
      <header className="sticky top-0 z-40 bg-[#070b14]/80 backdrop-blur-xl border border-white/10 mx-4 mt-4 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex justify-between items-center px-4 py-3 max-w-md md:mx-auto transition-all duration-300 w-[calc(100%-2rem)] rounded-2xl">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/event')}
            className="p-2 glass-panel rounded-lg text-white/80 border border-white/10 hover:bg-white/10"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex flex-col">
            <span className="font-montserrat text-[10px] font-bold text-cyan-400 tracking-[0.2em] uppercase">ПАПА</span>
            <span className="text-white/60 text-[10px] tracking-widest uppercase">ДОСТУП</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
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

      <main className="max-w-md mx-auto px-4 mt-6 flex flex-col gap-6 relative z-10 w-full">
        <div className="text-center mt-2 mb-2">
          <h1 className="font-montserrat text-2xl font-bold text-white tracking-widest uppercase text-glow drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            СУНДУКИ
          </h1>
        </div>

        {/* 01 ВЫБОР СУНДУКА */}
        <section className="glass-panel p-5 flex flex-col gap-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <h2 className="font-montserrat text-[10px] font-bold text-cyan-400/60 tracking-[0.2em] uppercase flex items-center gap-2">
            <span className="w-4 h-[1px] bg-cyan-400/30"></span>
            01 Выбор сундука
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => { setType('reward'); setIcon(null); setLevel(null); }}
              className={cn(
                "h-14 flex items-center justify-center gap-2 px-4 transition-all group rounded-xl relative overflow-hidden",
                type === 'reward' 
                  ? "bg-yellow-500/20 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]" 
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              )}
            >
              <Trophy className={cn("w-4 h-4", type === 'reward' ? "text-yellow-400" : "text-white/50")} />
              <span className={cn("font-montserrat uppercase tracking-widest font-bold text-[10px]", type === 'reward' ? "text-yellow-400" : "text-white/70")}>НАГРАДЫ</span>
            </button>
            <button 
              onClick={() => { setType('consequence'); setIcon(null); setLevel(null); }}
              className={cn(
                "h-14 flex items-center justify-center gap-2 px-4 transition-all group rounded-xl relative overflow-hidden",
                type === 'consequence' 
                  ? "bg-red-500/20 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              )}
            >
              <AlertTriangle className={cn("w-4 h-4", type === 'consequence' ? "text-red-400" : "text-white/50")} />
              <span className={cn("font-montserrat uppercase tracking-widest font-bold text-[10px]", type === 'consequence' ? "text-red-400" : "text-white/70")}>ПОСЛЕДСТВИЯ</span>
            </button>
          </div>
        </section>

        {/* 02 ВЫБОР ИКОНКИ */}
        <section className={cn("glass-panel p-5 flex flex-col gap-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500", !isIconActive && "opacity-40 pointer-events-none grayscale-[50%]")}>
          <h2 className="font-montserrat text-[10px] font-bold text-cyan-400/60 tracking-[0.2em] uppercase flex items-center gap-2">
            <span className="w-4 h-[1px] bg-cyan-400/30"></span>
            02 Выбор иконки
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {currentIcons.map((ic) => (
              <button 
                key={ic}
                onClick={() => setIcon(ic)}
                className={cn(
                  "aspect-square flex items-center justify-center text-2xl transition-all rounded-xl",
                  icon === ic
                    ? type === 'reward' ? "bg-yellow-500/20 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]" : "bg-red-500/20 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                )}
              >
                {ic}
              </button>
            ))}
          </div>
        </section>

        {/* 03 УРОВЕНЬ */}
        <section className={cn("glass-panel p-5 flex flex-col gap-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500", !isLevelActive && "opacity-40 pointer-events-none grayscale-[50%]")}>
          <h2 className="font-montserrat text-[10px] font-bold text-cyan-400/60 tracking-[0.2em] uppercase flex items-center gap-2">
            <span className="w-4 h-[1px] bg-cyan-400/30"></span>
            03 Уровень
          </h2>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((l) => (
              <button 
                key={l}
                onClick={() => setLevel(l)}
                className={cn(
                  "flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-all rounded-xl border",
                  level === l
                    ? type === 'reward' ? "bg-yellow-500/20 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]" : "bg-red-500/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
              >
                <div className="flex gap-0.5">{getLevelIcons(l, type || 'reward')}</div>
                <span className={cn("font-montserrat text-[9px] font-bold tracking-widest uppercase", level === l ? "text-white" : "text-white/50")}>Ур. {l}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 04 НАЗВАНИЕ */}
        <section className={cn("glass-panel p-5 flex flex-col gap-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500", !isNameActive && "opacity-40 pointer-events-none grayscale-[50%]")}>
          <h2 className="font-montserrat text-[10px] font-bold text-cyan-400/60 tracking-[0.2em] uppercase flex items-center gap-2">
            <span className="w-4 h-[1px] bg-cyan-400/30"></span>
            04 Название
          </h2>
          <div className="relative">
            <textarea 
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={140}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 p-4 resize-none h-[100px] rounded-xl relative z-10 font-nunito" 
              placeholder="Введите описание..."
            ></textarea>
            <div className="absolute bottom-3 right-4 font-montserrat text-[10px] text-white/40 font-bold z-20">
              {name.length}/140
            </div>
          </div>
        </section>

        {/* Submit Action */}
        <div className="mt-2">
          <button 
            disabled={!isReady}
            onClick={handleSave}
            className={cn(
              "w-full h-16 px-6 flex items-center justify-center gap-3 relative overflow-hidden transition-all duration-300 rounded-2xl border",
              saved ? "bg-emerald-500/30 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.5)]" :
              isReady 
                ? "bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:bg-cyan-500/30" 
                : "bg-white/5 border-white/10 opacity-50 cursor-not-allowed grayscale"
            )}
          >
            {isReady && !saved && <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>}
            <span className={cn("font-montserrat uppercase tracking-widest font-bold relative z-10 text-sm", 
              saved ? "text-emerald-400" : isReady ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "text-white/50"
            )}>
              {saved ? 'СОХРАНЕНО' : 'СОХРАНИТЬ'}
            </span>
            {saved ? (
              <Check className="relative z-10 w-5 h-5 text-emerald-400" />
            ) : (
              <Save className={cn("relative z-10 w-5 h-5", isReady ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "text-white/50")} />
            )}
          </button>
        </div>

        {/* Added list */}
        <div className="mt-8 pb-12 flex flex-col gap-6">
          <div className="text-center">
            <h2 className="font-montserrat text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase">ДОБАВЛЕНО</h2>
            <div className="w-12 h-[1px] bg-white/20 mx-auto mt-2"></div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h3 className="font-montserrat font-bold text-yellow-400 text-sm tracking-widest flex items-center gap-2"><Trophy size={16} /> НАГРАДЫ</h3>
              
              {[1, 2, 3, 4].map(l => {
                const items = chestsData['reward']?.[l] || [];
                if (items.length === 0) return null;
                return (
                  <div key={`rew-${l}`} className="flex flex-col gap-2 pl-2 border-l border-white/10 mt-2">
                    <h4 className="font-montserrat text-xs text-white/60 mb-1 flex items-center gap-1"><div className="flex gap-0.5">{getLevelIcons(l, 'reward')}</div> Уровень {l}</h4>
                    {items.map((c: any) => (
                      <div key={c.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{c.icon}</span>
                          <span className="font-nunito text-white/90 text-sm">{c.title}</span>
                        </div>
                        <button onClick={() => handleDelete(String(c.id))} className="text-white/30 hover:text-red-400 transition-colors p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-montserrat font-bold text-red-400 text-sm tracking-widest flex items-center gap-2"><AlertTriangle size={16} /> ПОСЛЕДСТВИЯ</h3>
              
              {[1, 2, 3, 4].map(l => {
                const items = chestsData['consequence']?.[l] || [];
                if (items.length === 0) return null;
                return (
                  <div key={`cons-${l}`} className="flex flex-col gap-2 pl-2 border-l border-white/10 mt-2">
                    <h4 className="font-montserrat text-xs text-white/60 mb-1 flex items-center gap-1"><div className="flex gap-0.5">{getLevelIcons(l, 'consequence')}</div> Уровень {l}</h4>
                    {items.map((c: any) => (
                      <div key={c.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{c.icon}</span>
                          <span className="font-nunito text-white/90 text-sm">{c.title}</span>
                        </div>
                        <button onClick={() => handleDelete(String(c.id))} className="text-white/30 hover:text-red-400 transition-colors p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
