export interface Sphere {
  id: string;
  name: string;
  emoji: string;
  score: number; // 0 to 10
}

export interface ChestItem {
  id: string;
  name: string;
  emoji: string;
  level: number; // 1 to 4
  type: 'reward' | 'consequence';
  status: 'locked' | 'active' | 'cooldown';
  cooldownDays?: number;
}

export interface MissionEvent {
  id: string;
  sphereId: string;
  title: string;
  comment: string;
  author: 'Папа' | 'Мама' | 'Бабушка';
  timestamp: string; // ISO string
  points: number; // positive or negative
}

export const INITIAL_SPHERES: Sphere[] = [
  { id: 'study', name: 'Учёба', emoji: '📚', score: 50.0 },
  { id: 'respect', name: 'Уважение', emoji: '🤝', score: 50.0 },
  { id: 'focus', name: 'Фокус', emoji: '🎯', score: 50.0 },
  { id: 'home', name: 'Семья', emoji: '🏠', score: 50.0 },
];

export const INITIAL_ENERGY = 0;

export const INITIAL_CHESTS: ChestItem[] = [
  { id: 'r1', name: '1 Час Игр', emoji: '🎮', level: 1, type: 'reward', status: 'active' },
  { id: 'r2', name: 'Поход в кино', emoji: '🍿', level: 3, type: 'reward', status: 'locked' },
  { id: 'c1', name: 'Уборка', emoji: '🧹', level: 2, type: 'consequence', status: 'active' },
  { id: 'c2', name: 'Без сладкого', emoji: '🚫', level: 1, type: 'consequence', status: 'cooldown', cooldownDays: 2 },
];

export const INITIAL_EVENTS: MissionEvent[] = [];
