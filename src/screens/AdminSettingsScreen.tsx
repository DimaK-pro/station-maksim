import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronLeft, Save, Check } from 'lucide-react';
import bgImage from '../assets/BG-min.jpg';
import { cn } from '../utils/cn';

export const AdminSettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  
  // ФОРМУЛА ЭНЕРГИИ
  const [kDivisor, setKDivisor] = useState(30);
  const [decayFactor, setDecayFactor] = useState(0.92);

  // ПОРОГИ СОСТОЯНИЙ СТАНЦИИ
  const [thresholdPlus, setThresholdPlus] = useState(50);
  const [thresholdMinus, setThresholdMinus] = useState(-50);

  // ЗНАЧЕНИЯ СИЛЫ СОБЫТИЙ
  const [goodPoints, setGoodPoints] = useState([5, 10, 20, 30, 50]);
  const [neutralPoints, setNeutralPoints] = useState([-2, -1, 0, 1, 2]);
  const [badPoints, setBadPoints] = useState([-5, -10, -20, -30, -50]);

  // ПОРОГИ СУНДУКОВ — НАГРАДЫ
  const [rewardDays, setRewardDays] = useState([1, 7, 14, 30]);

  // ПОРОГИ СУНДУКОВ — ПОСЛЕДСТВИЯ
  const [consDays, setConsDays] = useState([1, 3, 7, 14]);

  // PIN-КОДЫ
  const [activePinForm, setActivePinForm] = useState<'papa' | 'mama' | 'babushka' | null>(null);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const handlePointChange = (type: 'good' | 'neutral' | 'bad', index: number, value: string) => {
    const val = parseInt(value) || 0;
    if (type === 'good') {
      const newArr = [...goodPoints];
      newArr[index] = val;
      setGoodPoints(newArr);
    } else if (type === 'neutral') {
      const newArr = [...neutralPoints];
      newArr[index] = val;
      setNeutralPoints(newArr);
    } else {
      const newArr = [...badPoints];
      newArr[index] = val;
      setBadPoints(newArr);
    }
  };

  const handleDaysChange = (type: 'reward' | 'cons', index: number, value: string) => {
    const val = parseInt(value) || 0;
    if (type === 'reward') {
      const newArr = [...rewardDays];
      newArr[index] = val;
      setRewardDays(newArr);
    } else {
      const newArr = [...consDays];
      newArr[index] = val;
      setConsDays(newArr);
    }
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
            <span className="text-white/60 text-[10px] tracking-widest uppercase">НАСТРОЙКИ</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="flex items-center justify-center w-9 h-9 glass-panel rounded-full border border-white/10 hover:bg-red-500/20 hover:border-red-500/40 transition-all text-white/50 hover:text-red-400">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-6 flex flex-col gap-8 relative z-10 w-full">
        <div className="text-center mt-2 mb-2">
          <h1 className="font-montserrat text-2xl font-bold text-white tracking-widest uppercase text-glow drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            НАСТРОЙКИ
          </h1>
        </div>

        {/* ФОРМУЛА ЭНЕРГИИ */}
        <section className="glass-panel p-5 flex flex-col gap-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <h2 className="font-montserrat text-[10px] font-bold text-cyan-400/60 tracking-[0.2em] uppercase flex items-center gap-2">
            <span className="w-4 h-[1px] bg-cyan-400/30"></span>
            ФОРМУЛА ЭНЕРГИИ
          </h2>
          
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-montserrat text-xs tracking-wider font-bold text-white">Делитель кривой k</span>
                <span className="font-nunito font-bold text-cyan-400 bg-white/10 px-2 py-0.5 rounded text-sm">{kDivisor}</span>
              </div>
              <input 
                type="range" 
                min="10" max="60" step="1" 
                value={kDivisor} 
                onChange={(e) => setKDivisor(parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <p className="text-[10px] text-white/40 font-nunito">Влияет на скорость набора энергии. Больше = медленнее.</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-montserrat text-xs tracking-wider font-bold text-white">Коэффициент затухания</span>
                <span className="font-nunito font-bold text-cyan-400 bg-white/10 px-2 py-0.5 rounded text-sm">{decayFactor.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0.80" max="0.99" step="0.01" 
                value={decayFactor} 
                onChange={(e) => setDecayFactor(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <p className="text-[10px] text-white/40 font-nunito">Каждую ночь S × коэффициент. Меньше = быстрее забывается.</p>
            </div>
          </div>
        </section>

        {/* ПОРОГИ СОСТОЯНИЙ СТАНЦИИ */}
        <section className="glass-panel p-5 flex flex-col gap-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <h2 className="font-montserrat text-[10px] font-bold text-cyan-400/60 tracking-[0.2em] uppercase flex items-center gap-2">
            <span className="w-4 h-[1px] bg-cyan-400/30"></span>
            ПОРОГИ СОСТОЯНИЙ СТАНЦИИ
          </h2>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-montserrat text-xs tracking-wider font-bold text-cyan-400">Порог плюса (E)</span>
                <input 
                  type="number" 
                  value={thresholdPlus} 
                  onChange={(e) => setThresholdPlus(parseInt(e.target.value) || 0)}
                  className="w-20 bg-black/40 border border-cyan-500/30 rounded-lg px-2 py-1 text-sm font-nunito text-cyan-400 focus:outline-none focus:border-cyan-400 text-center"
                />
              </div>
              <p className="text-[10px] text-white/40 font-nunito">Выше этого значения — станция синяя, начинается отсчёт дней для наград. Между 0 и порогом — /warning.</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-montserrat text-xs tracking-wider font-bold text-red-400">Порог минуса (E)</span>
                <input 
                  type="number" 
                  value={thresholdMinus} 
                  onChange={(e) => setThresholdMinus(parseInt(e.target.value) || 0)}
                  className="w-20 bg-black/40 border border-red-500/30 rounded-lg px-2 py-1 text-sm font-nunito text-red-400 focus:outline-none focus:border-red-400 text-center"
                />
              </div>
              <p className="text-[10px] text-white/40 font-nunito">Ниже этого значения — /critical, начинается отсчёт для последствий. Между 0 и порогом — /danger.</p>
            </div>
          </div>
        </section>

        {/* ЗНАЧЕНИЯ СИЛЫ СОБЫТИЙ */}
        <section className="glass-panel p-5 flex flex-col gap-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <h2 className="font-montserrat text-[10px] font-bold text-cyan-400/60 tracking-[0.2em] uppercase flex items-center gap-2">
            <span className="w-4 h-[1px] bg-cyan-400/30"></span>
            ЗНАЧЕНИЯ СИЛЫ СОБЫТИЙ
          </h2>
          
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="font-montserrat text-xs tracking-wider font-bold text-emerald-400">Хорошее</span>
              <div className="flex gap-2">
                {goodPoints.map((val, i) => (
                  <input 
                    key={`good-${i}`}
                    type="number" 
                    value={val}
                    onChange={(e) => handlePointChange('good', i, e.target.value)}
                    className="flex-1 w-0 min-w-0 bg-emerald-500/10 border border-emerald-500/30 rounded-xl py-2 text-center text-sm font-bold font-montserrat text-emerald-400 focus:outline-none focus:border-emerald-400 focus:bg-emerald-500/20"
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-montserrat text-xs tracking-wider font-bold text-white">Нейтральное</span>
              <div className="flex gap-2">
                {neutralPoints.map((val, i) => (
                  <input 
                    key={`neutral-${i}`}
                    type="number" 
                    value={val}
                    onChange={(e) => handlePointChange('neutral', i, e.target.value)}
                    className="flex-1 w-0 min-w-0 bg-white/5 border border-white/20 rounded-xl py-2 text-center text-sm font-bold font-montserrat text-white focus:outline-none focus:border-white focus:bg-white/10"
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-montserrat text-xs tracking-wider font-bold text-red-400">Плохое</span>
              <div className="flex gap-2">
                {badPoints.map((val, i) => (
                  <input 
                    key={`bad-${i}`}
                    type="number" 
                    value={val}
                    onChange={(e) => handlePointChange('bad', i, e.target.value)}
                    className="flex-1 w-0 min-w-0 bg-red-500/10 border border-red-500/30 rounded-xl py-2 text-center text-sm font-bold font-montserrat text-red-400 focus:outline-none focus:border-red-400 focus:bg-red-500/20"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ПОРОГИ СУНДУКОВ — НАГРАДЫ */}
        <section className="glass-panel p-5 flex flex-col gap-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <h2 className="font-montserrat text-[10px] font-bold text-yellow-400/60 tracking-[0.2em] uppercase flex items-center gap-2">
            <span className="w-4 h-[1px] bg-yellow-400/30"></span>
            ПОРОГИ СУНДУКОВ — НАГРАДЫ
          </h2>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] font-montserrat text-white/40 mb-1 px-1 uppercase tracking-widest">
              <span>Уровень</span>
              <span>Срабатывает чз N дней</span>
            </div>
            {rewardDays.map((val, i) => (
              <div key={`rew-${i}`} className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="font-montserrat text-xs font-bold text-yellow-400 tracking-widest">УРОВЕНЬ {i + 1}</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={val}
                    onChange={(e) => handleDaysChange('reward', i, e.target.value)}
                    className="w-16 bg-black/40 border border-yellow-500/30 rounded-lg px-2 py-1 text-sm font-nunito text-yellow-400 focus:outline-none focus:border-yellow-400 text-center font-bold"
                  />
                  <span className="text-white/50 text-xs font-nunito w-4">дн</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ПОРОГИ СУНДУКОВ — ПОСЛЕДСТВИЯ */}
        <section className="glass-panel p-5 flex flex-col gap-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <h2 className="font-montserrat text-[10px] font-bold text-red-400/60 tracking-[0.2em] uppercase flex items-center gap-2">
            <span className="w-4 h-[1px] bg-red-400/30"></span>
            ПОРОГИ СУНДУКОВ — ПОСЛЕДСТВИЯ
          </h2>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] font-montserrat text-white/40 mb-1 px-1 uppercase tracking-widest">
              <span>Уровень</span>
              <span>Срабатывает чз N дней</span>
            </div>
            {consDays.map((val, i) => (
              <div key={`cons-${i}`} className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="font-montserrat text-xs font-bold text-red-400 tracking-widest">УРОВЕНЬ {i + 1}</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={val}
                    onChange={(e) => handleDaysChange('cons', i, e.target.value)}
                    className="w-16 bg-black/40 border border-red-500/30 rounded-lg px-2 py-1 text-sm font-nunito text-red-400 focus:outline-none focus:border-red-400 text-center font-bold"
                  />
                  <span className="text-white/50 text-xs font-nunito w-4">дн</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PIN-КОДЫ */}
        <section className="glass-panel p-5 flex flex-col gap-4 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <h2 className="font-montserrat text-[10px] font-bold text-cyan-400/60 tracking-[0.2em] uppercase flex items-center gap-2">
            <span className="w-4 h-[1px] bg-cyan-400/30"></span>
            PIN-КОДЫ
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { id: 'papa', label: 'Сменить свой PIN' },
              { id: 'mama', label: 'Сбросить PIN Мамы' },
              { id: 'babushka', label: 'Сбросить PIN Бабушки' }
            ].map(pinItem => (
              <div key={pinItem.id} className="flex flex-col gap-2">
                <button 
                  onClick={() => setActivePinForm(activePinForm === pinItem.id ? null : pinItem.id as any)}
                  className="w-full h-12 glass-panel flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-white/80"
                >
                  <span className="font-montserrat text-xs font-bold tracking-widest uppercase">{pinItem.label}</span>
                </button>
                {activePinForm === pinItem.id && (
                  <div className="bg-black/30 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                    {pinItem.id === 'papa' && (
                      <input 
                        type="password" 
                        placeholder="Старый PIN" 
                        maxLength={4}
                        value={oldPin}
                        onChange={(e) => setOldPin(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-nunito text-white focus:outline-none focus:border-cyan-500 text-center tracking-[0.5em]"
                      />
                    )}
                    <input 
                      type="password" 
                      placeholder="Новый PIN" 
                      maxLength={4}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-nunito text-white focus:outline-none focus:border-cyan-500 text-center tracking-[0.5em]"
                    />
                    <button 
                      onClick={() => {
                        setActivePinForm(null);
                        setOldPin('');
                        setNewPin('');
                      }}
                      className="w-full h-10 glass-panel flex items-center justify-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all text-cyan-400 mt-1"
                    >
                      <span className="font-montserrat text-xs font-bold tracking-widest uppercase">ПОДТВЕРДИТЬ</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Submit Action */}
        <div className="mt-2 pb-8">
          <button 
            onClick={handleSave}
            className={cn(
              "w-full h-16 px-6 flex items-center justify-center gap-3 relative overflow-hidden transition-all duration-300 rounded-2xl border",
              saved ? "bg-emerald-500/30 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.5)]" : "bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:bg-cyan-500/30"
            )}
          >
            {!saved && <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>}
            <span className={cn(
              "font-montserrat uppercase tracking-widest font-bold relative z-10 text-sm",
              saved ? "text-emerald-400" : "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            )}>
              {saved ? 'НАСТРОЙКИ СОХРАНЕНЫ' : 'СОХРАНИТЬ НАСТРОЙКИ'}
            </span>
            {saved ? (
              <Check className="relative z-10 w-5 h-5 text-emerald-400" />
            ) : (
              <Save className="relative z-10 w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            )}
          </button>
        </div>
      </main>
    </div>
  );
};
