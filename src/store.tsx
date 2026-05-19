import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_ENERGY, INITIAL_SPHERES, INITIAL_CHESTS, INITIAL_EVENTS, Sphere, ChestItem, MissionEvent } from './mockData';
import { API_URL } from './api';
import { getEventTitle } from './utils/eventTitles';

interface AppState {
  isStateReady: boolean;
  energy: number;
  thresholdPlus: number;
  thresholdMinus: number;
  rewardEnergyThresholds: number[];
  consequenceEnergyThresholds: number[];
  weightsGood: number[];
  weightsNeutral: number[];
  weightsBad: number[];
  spheres: Sphere[];
  chests: ChestItem[];
  chestStatus: {
    reward: ChestState;
    consequence: ChestState;
  };
  events: MissionEvent[];
  addEvent: (event: Omit<MissionEvent, 'id' | 'timestamp'>) => Promise<boolean>;
  deleteEvent: (id: string) => void;
  updateEnergy: (delta: number) => void;
  spinChest: (chestType: 'reward' | 'consequence') => Promise<any>;
}

const AppContext = createContext<AppState | undefined>(undefined);

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

const mapChestItems = (items: any[]): ChestItem[] => items.map((c: any) => ({
  id: String(c.id),
  name: c.title,
  emoji: c.icon,
  level: c.level,
  type: c.chestType,
  status: 'active' as const
}));

export const AppProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isStateReady, setIsStateReady] = useState(false);
  const [energy, setEnergy] = useState(INITIAL_ENERGY);
  const [thresholdPlus, setThresholdPlus] = useState(50);
  const [thresholdMinus, setThresholdMinus] = useState(-50);
  const [rewardEnergyThresholds, setRewardEnergyThresholds] = useState([50, 50, 50, 50]);
  const [consequenceEnergyThresholds, setConsequenceEnergyThresholds] = useState([-50, -50, -50, -50]);
  const [weightsGood, setWeightsGood] = useState([5, 10, 20, 35, 50]);
  const [weightsNeutral, setWeightsNeutral] = useState([-2, -1, 0, 1, 2]);
  const [weightsBad, setWeightsBad] = useState([-5, -10, -20, -35, -50]);
  const [spheres, setSpheres] = useState<Sphere[]>(INITIAL_SPHERES);
  const [chests, setChests] = useState<ChestItem[]>(INITIAL_CHESTS);
  const [chestStatus, setChestStatus] = useState<AppState['chestStatus']>({
    reward: { status: 'locked', daysLeft: null, level: null, progress: 0, maxProgress: 1 },
    consequence: { status: 'locked', daysLeft: null, level: null, progress: 0, maxProgress: 1 }
  });
  const [events, setEvents] = useState(INITIAL_EVENTS);

  const applyState = (stateUpdate: any) => {
    const state = stateUpdate?.type === 'state_update' && stateUpdate.data ? stateUpdate.data : stateUpdate;
    if (!state) return;

    if (state.energy !== undefined) setEnergy(state.energy);
    if (state.thresholdPlus !== undefined) setThresholdPlus(state.thresholdPlus);
    if (state.thresholdMinus !== undefined) setThresholdMinus(state.thresholdMinus);
    if (state.rewardEnergyThresholds) setRewardEnergyThresholds(state.rewardEnergyThresholds);
    if (state.consequenceEnergyThresholds) setConsequenceEnergyThresholds(state.consequenceEnergyThresholds);
    if (state.weightsGood) setWeightsGood(state.weightsGood);
    if (state.weightsNeutral) setWeightsNeutral(state.weightsNeutral);
    if (state.weightsBad) setWeightsBad(state.weightsBad);
    if (state.spheres) {
      setSpheres(prev => prev.map(s => ({ ...s, score: state.spheres[s.id] ?? s.score })));
    }
    if (state.chestItems) {
      setChests(mapChestItems(state.chestItems));
    }
    setChestStatus({
      reward: state.rewardChest || { status: 'locked', daysLeft: null, level: null, progress: 0, maxProgress: 1 },
      consequence: state.consequenceChest || { status: 'locked', daysLeft: null, level: null, progress: 0, maxProgress: 1 }
    });
    
    if (state.recentEvents) {
      const mappedEvents = state.recentEvents.map((e: any) => ({
        id: String(e.id),
        sphereId: e.sphere,
        title: getEventTitle(e.type, e.weight),
        comment: e.comment || '',
        author: e.author?.role === 'papa' ? 'Папа' : e.author?.role === 'mama' ? 'Мама' : 'Бабушка',
        timestamp: e.createdAt,
        points: e.weight
      }));
      setEvents(mappedEvents);
    }
  };

  useEffect(() => {
    // Attempt to fetch from API, otherwise fallback to mock data
    const fetchState = async () => {
      try {
        const { api } = await import('./api');
        const state = await api.getStation();
        setEnergy(state.energy);
        if (state.thresholdPlus !== undefined) setThresholdPlus(state.thresholdPlus);
        if (state.thresholdMinus !== undefined) setThresholdMinus(state.thresholdMinus);
        if (state.rewardEnergyThresholds) setRewardEnergyThresholds(state.rewardEnergyThresholds);
        if (state.consequenceEnergyThresholds) setConsequenceEnergyThresholds(state.consequenceEnergyThresholds);
        if (state.weightsGood) setWeightsGood(state.weightsGood);
        if (state.weightsNeutral) setWeightsNeutral(state.weightsNeutral);
        if (state.weightsBad) setWeightsBad(state.weightsBad);
        // Map spheres to our frontend structure
        setSpheres(prev => prev.map(s => ({
          ...s,
          score: state.spheres[s.id] ?? s.score
        })));
        // Fetch chest items
        const chestItemsRaw = state.chestItems || await api.getChests();
        let flatItems: any[] = [];
        
        if (Array.isArray(chestItemsRaw)) {
          flatItems = chestItemsRaw;
        } else if (typeof chestItemsRaw === 'object' && chestItemsRaw !== null) {
          // Flatten the grouped object
          Object.values(chestItemsRaw).forEach((levelGroup: any) => {
            Object.values(levelGroup).forEach((items: any) => {
              if (Array.isArray(items)) {
                flatItems = flatItems.concat(items);
              }
            });
          });
        }
        
        setChests(mapChestItems(flatItems));
        // Update overall chest status
        setChestStatus({
          reward: state.rewardChest || { status: 'locked', daysLeft: null, level: null, progress: 0, maxProgress: 1 },
          consequence: state.consequenceChest || { status: 'locked', daysLeft: null, level: null, progress: 0, maxProgress: 1 }
        });
        // Map recent events
        if (state.recentEvents) {
          const mappedEvents = state.recentEvents.map((e: any) => ({
            id: String(e.id),
            sphereId: e.sphere,
            title: getEventTitle(e.type, e.weight),
            comment: e.comment || '',
            author: e.author?.role === 'papa' ? 'Папа' : e.author?.role === 'mama' ? 'Мама' : 'Бабушка',
            timestamp: e.createdAt,
            points: e.weight
          }));
          setEvents(mappedEvents);
        }
      } catch (err) {
        console.log('Backend not available, using mock data', err);
      } finally {
        setIsStateReady(true);
      }
      
      // Load token from localStorage
      const storedToken = localStorage.getItem('station_token');
      if (storedToken) {
        setToken(storedToken);
      }
    };
    fetchState();
  }, []);

  useEffect(() => {
    // Try setting up SSE with token
    const storedToken = localStorage.getItem('station_token') || token;
    const es = new EventSource(`${API_URL}/sse/station${storedToken ? `?token=${storedToken}` : ''}`);
    es.onmessage = (e) => {
      try {
        applyState(JSON.parse(e.data));
      } catch (err) {}
    };
    return () => es.close();
  }, [token]);

  const addEvent = async (eventData: Omit<MissionEvent, 'id' | 'timestamp'>) => {
    // If we have a token, send to backend
    if (token) {
      try {
        const { api } = await import('./api');
        const state = await api.addEvent(token, {
          sphere: eventData.sphereId,
          type: eventData.points > 0 ? 'good' : eventData.points < 0 ? 'bad' : 'neutral',
          weight: eventData.points,
          comment: eventData.comment
        });
        // Update state immediately from API response
        applyState(state);
        return true;
      } catch (err) {
        console.error('Failed to add event via API', err);
        return false;
      }
    }

    // Fallback local logic if backend is slow
    const newEvent: MissionEvent = {
      ...eventData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    setEvents([newEvent, ...events]);
    
    // Approximate global energy change (raw points divided by 4 spheres)
    setEnergy(prev => Math.max(-100, Math.min(100, prev + (eventData.points / 4))));
    
    // Update sphere score
    setSpheres(prev => prev.map(s => {
      if (s.id === eventData.sphereId) {
        return { ...s, score: Math.max(0, Math.min(100, s.score + (eventData.points > 0 ? 2 : -2))) };
      }
      return s;
    }));
    return true;
  };
  const deleteEvent = async (id: string) => {
    if (token) {
      try {
        const { api } = await import('./api');
        const state = await api.deleteEvent(token, id);
        applyState(state);
      } catch (err) {
        console.error('Failed to delete event via API', err);
      }
    } else {
      setEvents(prev => prev.filter(e => e.id !== id));
    }
  };


  const updateEnergy = (delta: number) => {
    setEnergy(prev => Math.max(-100, Math.min(100, prev + delta)));
  };

  const spinChest = async (chestType: 'reward' | 'consequence') => {
    try {
      const { api } = await import('./api');
      const result = await api.spin(chestType);
      
      // Also fetch updated station state so we immediately see the lock
      const state = await api.getStation();
      applyState(state);
      
      return result;
    } catch (e) {
      console.error('Failed to spin chest via API', e);
      return null;
    }
  };

  return (
    <AppContext.Provider value={{ isStateReady, energy, thresholdPlus, thresholdMinus, rewardEnergyThresholds, consequenceEnergyThresholds, weightsGood, weightsNeutral, weightsBad, spheres, chests, events, addEvent, deleteEvent, updateEnergy, chestStatus, spinChest }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
};
