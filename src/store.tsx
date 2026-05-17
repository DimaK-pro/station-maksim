import React, { createContext, useContext, useState } from 'react';
import { INITIAL_ENERGY, INITIAL_SPHERES, INITIAL_CHESTS, INITIAL_EVENTS, Sphere, ChestItem, MissionEvent } from './mockData';

interface AppState {
  energy: number;
  spheres: Sphere[];
  chests: ChestItem[];
  events: MissionEvent[];
  addEvent: (event: Omit<MissionEvent, 'id' | 'timestamp'>) => void;
  updateEnergy: (delta: number) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [energy, setEnergy] = useState(INITIAL_ENERGY);
  const [spheres, setSpheres] = useState(INITIAL_SPHERES);
  const [chests] = useState(INITIAL_CHESTS);
  const [events, setEvents] = useState(INITIAL_EVENTS);

  const addEvent = (eventData: Omit<MissionEvent, 'id' | 'timestamp'>) => {
    const newEvent: MissionEvent = {
      ...eventData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    setEvents([newEvent, ...events]);
    setEnergy(prev => Math.max(-100, Math.min(100, prev + eventData.points)));
    
    // Update sphere score
    setSpheres(prev => prev.map(s => {
      if (s.id === eventData.sphereId) {
        return { ...s, score: Math.max(0, Math.min(10, s.score + (eventData.points > 0 ? 0.5 : -0.5))) };
      }
      return s;
    }));
  };

  const updateEnergy = (delta: number) => {
    setEnergy(prev => Math.max(-100, Math.min(100, prev + delta)));
  };

  return (
    <AppContext.Provider value={{ energy, spheres, chests, events, addEvent, updateEnergy }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
};
