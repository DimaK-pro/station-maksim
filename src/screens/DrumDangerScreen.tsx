import React, { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAppStore } from '../store';
import { ChestItem } from '../mockData';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

// Removed unused import
import headerImage from '../assets/header-screen1-min.png';
import headerDangerImage from '../assets/header-screen4-min.png';
import barabanFrameImage from '../assets/baraban1-min.png';
import barabanDangerImage from '../assets/baraban2-min.png';

export const DrumDangerScreen: React.FC = () => {
  const navigate = useNavigate();
  // Always penalty for DrumDangerScreen
  const type = "consequence";
  const isReward = false;
  
  const { chests, spinChest, chestStatus, isStateReady } = useAppStore();
  
  const currentLevel = chestStatus.consequence.level || 1;
  const items = chests.filter(c => c.type === type && c.level === currentLevel);
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<ChestItem | null>(null);
  const [spinItems, setSpinItems] = useState<ChestItem[] | null>(null);
  const [itemHeight, setItemHeight] = useState(90);
  const drumRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const spinInFlightRef = useRef(false);
  const visibleItems = spinItems || items;
  
  // Create a large array to simulate an infinite drum
  const drumItems = Array(40).fill(visibleItems).flat();

  React.useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
         const w = containerRef.current.clientWidth;
         // Set item height proportionally to the container width. 
         // Assuming roughly ~3.5 items visible in the hole
         setItemHeight(w * 0.225);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleSwipe = async () => {
    if (spinInFlightRef.current || chestStatus.consequence.status !== 'available' || isSpinning || items.length === 0) return;
    const spinSnapshot = items;
    spinInFlightRef.current = true;
    setIsSpinning(true);
    setSpinItems(spinSnapshot);
    setResult(null);
    
    // Call backend to get the actual result
    const spinResponse = await spinChest(type);
    
    // If spin failed, abort
    if (!spinResponse) {
      spinInFlightRef.current = false;
      setIsSpinning(false);
      setSpinItems(null);
      return;
    }
    
    // Find the index of the winning item
    let winningIndex = spinSnapshot.findIndex(i => String(i.id) === String(spinResponse?.chestItemId));
    if (winningIndex === -1) {
      winningIndex = Math.floor(Math.random() * spinSnapshot.length); // Fallback
    }
    const winner = spinSnapshot[winningIndex];
    
    // We land on the deep copy of the items array to ensure a long spin
    const targetRealIndex = spinSnapshot.length * 20 + winningIndex;
    
    // Since drumRef is anchored at the exact vertical center of the window,
    // translating by -(index * height) places that exact item exactly in the center.
    const targetY = -(targetRealIndex * itemHeight);
    
    if (drumRef.current) {
      // Reset position to top
      gsap.set(drumRef.current, { y: 0 });
      
      // Spin animation
      gsap.to(drumRef.current, {
        y: targetY,
        duration: 4,
        ease: "power4.inOut", 
        onComplete: () => {
          spinInFlightRef.current = false;
          setResult(winner);
          setIsSpinning(false);
        }
      });
    } else {
      spinInFlightRef.current = false;
      setResult(winner);
      setIsSpinning(false);
    }
  };

  if (!isStateReady) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-b from-[#251010] to-[#0a0505]">
        <div className="w-10 h-10 rounded-full border-2 border-[#fca5a5] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (chestStatus.consequence.status !== 'available' && !isSpinning && !result) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={cn("min-h-[100dvh] flex flex-col items-center relative overflow-x-hidden overflow-y-auto", 
      isReward ? "bg-gradient-to-b from-[#1c1e2d] to-[#131418]" : "bg-gradient-to-b from-[#251010] to-[#0a0505]"
    )}>
      
      {/* Background with requested gradient */}
      
      <div className="relative z-20 flex flex-col items-center w-full max-w-lg mx-auto pt-4 pb-6 min-h-screen">
        
        {/* Header */}
        <motion.div 
          className="w-full shrink-0 px-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <img src={isReward ? headerImage : headerDangerImage} alt="Header" className="w-full h-auto object-contain drop-shadow-[0_4px_15px_rgba(0,0,0,0.3)]" />
        </motion.div>

        {/* Title area - flex-1 pushes it to center between header and drum */}
        <div className="flex-1 w-full flex items-center justify-center px-4 pt-6 translate-y-[50px]">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full text-center relative"
          >
            <h1 
              className={cn("font-montserrat text-3xl sm:text-4xl font-black tracking-normal uppercase text-transparent bg-clip-text",
                isReward ? "drop-shadow-[0_0_30px_rgba(250,204,21,1)]" : "drop-shadow-[0_0_30px_rgba(239,68,68,1)]"
              )}
              style={{ backgroundImage: isReward ? 'linear-gradient(to bottom, #f6e2a7 0%, #a97241 100%)' : 'linear-gradient(to bottom, #fca5a5 0%, #dc2626 100%)' }}
            >
              {isReward ? "БАРАБАН НАГРАД" : "ПОСЛЕДСТВИЯ"}
            </h1>
          </motion.div>
        </div>

        {/* The Drum Area - Full Width */}
        <motion.div 
          ref={containerRef}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative w-[100vw] sm:w-full max-w-[500px] shrink-0 -mt-8 -mb-4 cursor-grab active:cursor-grabbing touch-none select-none flex justify-center"
          onPointerDown={(e) => {
             const startY = e.clientY;
             const handleMove = (ev: PointerEvent) => {
               if (ev.clientY > startY + 20 || ev.clientY < startY - 20) {
                 handleSwipe();
                 document.removeEventListener('pointermove', handleMove);
               }
             };
             const handleUp = () => {
                 document.removeEventListener('pointermove', handleMove);
                 document.removeEventListener('pointerup', handleUp);
             };
             document.addEventListener('pointermove', handleMove);
             document.addEventListener('pointerup', handleUp, {once:true});
          }}
          onClick={handleSwipe}
        >
          
          {/* Cylinder Hole - Matches the transparent window of the PNG */}
          {/* Moved top down slightly, and increased left/right padding so it doesn't stick out */}
          <div className={cn("absolute z-10 rounded-[3rem] overflow-hidden",
                isReward ? "bg-gradient-to-b from-[#e5e5e5] via-[#ffffff] to-[#e5e5e5]" : "bg-gradient-to-b from-[#111] via-[#2a2a2a] to-[#111]"
               )}
               style={{ top: '27%', bottom: '23%', left: '18%', right: '18%' }}>
            
            {/* Center Anchor Point */}
            <div className="absolute top-1/2 left-0 right-0 z-10" style={{ transform: 'translateY(-50%)' }}>
              
              {/* Spinning Track */}
              <div ref={drumRef} className="relative w-full" style={{ top: `-${itemHeight / 2}px` }}>
                {drumItems.map((item, i) => (
                  <div key={i} className="absolute w-full flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 px-2 sm:px-6 text-center" 
                       style={{ top: `${i * itemHeight}px`, height: `${itemHeight}px` }}>
                    <span className="text-3xl sm:text-4xl drop-shadow-sm flex-shrink-0">{item.emoji}</span>
                    <span 
                      className={cn("font-montserrat font-black text-lg sm:text-2xl uppercase tracking-wide truncate w-full",
                        isReward ? "text-[#452a10]" : "text-white"
                      )} 
                      style={{ textShadow: isReward ? '0 1px 1px rgba(255,255,255,0.8)' : '0 2px 4px rgba(0,0,0,0.8)' }}>
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inner Cylinder Shadow to give depth */}
            <div className="absolute inset-0 shadow-[inset_0_40px_30px_rgba(0,0,0,0.5),inset_0_-40px_30px_rgba(0,0,0,0.5)] z-20 pointer-events-none"></div>

            {/* Selection Highlight perfectly centered */}
            <div className="absolute top-1/2 left-[5%] right-[5%] -translate-y-1/2 z-30 pointer-events-none" style={{ height: `${itemHeight}px` }}>
              <div className={cn("w-full h-full rounded-2xl border-[3px] bg-gradient-to-b from-white/20 to-transparent",
                  isReward ? "border-[#ca8a04]/40 shadow-[0_0_20px_rgba(250,204,21,0.2)]" : "border-[#ef4444]/40 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                )}></div>
            </div>
          </div>

          {/* Foreground Frame Image */}
          <img 
            src={isReward ? barabanFrameImage : barabanDangerImage} 
            alt="Drum Frame" 
            className="relative z-30 w-full h-auto block drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] pointer-events-none" 
          />
          
        </motion.div>
        
        {/* Bottom Section: flex-1 pushes it to center between drum and bottom */}
        {/* Added pb-6 to push content slightly up to visually center relative to the physical drum */}
        <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[140px] z-40 pb-6">
          
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="swipe"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex flex-col items-center pointer-events-none"
              >
                {/* Custom elegant swipe indicator */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex flex-col items-center opacity-90"
                >
                  <span 
                    className={cn("material-symbols-outlined text-[4rem] text-transparent bg-clip-text leading-none",
                      isReward ? "drop-shadow-[0_0_30px_rgba(250,204,21,1)]" : "drop-shadow-[0_0_30px_rgba(239,68,68,1)]"
                    )} 
                    style={{ backgroundImage: isReward ? 'linear-gradient(to bottom, #f6e2a7 0%, #a97241 100%)' : 'linear-gradient(to bottom, #fca5a5 0%, #dc2626 100%)' }}>
                    swipe_up
                  </span>
                  <p 
                    className={cn("font-montserrat font-black text-lg mt-2 tracking-normal uppercase text-transparent bg-clip-text",
                      isReward ? "drop-shadow-[0_0_30px_rgba(250,204,21,1)]" : "drop-shadow-[0_0_30px_rgba(239,68,68,1)]"
                    )}
                    style={{ backgroundImage: isReward ? 'linear-gradient(to bottom, #f6e2a7 0%, #a97241 100%)' : 'linear-gradient(to bottom, #fca5a5 0%, #dc2626 100%)' }}
                  >
                    СВАЙП
                  </p>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div 
                key="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex flex-col items-center justify-center gap-4 px-6"
              >
                <div className="w-full max-w-[360px] text-center">
                  <div className="text-4xl sm:text-5xl mb-2">{result.emoji}</div>
                  <p className={cn("font-montserrat font-black text-xl sm:text-2xl uppercase tracking-normal break-words",
                    isReward ? "text-[#f6e2a7] drop-shadow-[0_0_18px_rgba(250,204,21,0.65)]" : "text-[#fecaca] drop-shadow-[0_0_18px_rgba(239,68,68,0.65)]"
                  )}>
                    {result.name}
                  </p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/')}
                  className={cn("w-full max-w-[320px] py-5 rounded-full font-montserrat font-black text-2xl tracking-wider",
                    isReward ? "text-[#452a10]" : "text-white"
                  )}
                  style={isReward ? {
                    background: 'linear-gradient(to bottom, #f6e2a7 0%, #a97241 100%)',
                    boxShadow: '0 8px 0 #7b4a20, 0 15px 20px rgba(0,0,0,0.4), 0 0 40px rgba(246,226,167,0.6)',
                    textShadow: '0 1px 1px rgba(255,255,255,0.4)',
                  } : {
                    background: 'linear-gradient(to bottom, #f87171 0%, #b91c1c 100%)',
                    boxShadow: '0 8px 0 #7f1d1d, 0 15px 20px rgba(0,0,0,0.4), 0 0 40px rgba(239,68,68,0.6)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                  }}
                >
                  {isReward ? "ЗАБРАТЬ! 🚀" : "ПРИНЯТЬ!"}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
