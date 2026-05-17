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
  { id: 'study', name: 'Учёба', emoji: '📚', score: 8.5 },
  { id: 'respect', name: 'Уважение', emoji: '🤝', score: 6.0 },
  { id: 'focus', name: 'Фокус', emoji: '🎯', score: 4.5 },
  { id: 'family', name: 'Семья', emoji: '🏠', score: 9.0 },
];

export const INITIAL_ENERGY = 47;

export const INITIAL_CHESTS: ChestItem[] = [
  { id: 'r1', name: '1 Час Игр', emoji: '🎮', level: 1, type: 'reward', status: 'active' },
  { id: 'r2', name: 'Поход в кино', emoji: '🍿', level: 3, type: 'reward', status: 'locked' },
  { id: 'c1', name: 'Уборка', emoji: '🧹', level: 2, type: 'consequence', status: 'active' },
  { id: 'c2', name: 'Без сладкого', emoji: '🚫', level: 1, type: 'consequence', status: 'cooldown', cooldownDays: 2 },
];

export const INITIAL_EVENTS: MissionEvent[] = [
  {
    id: 'e1',
    sphereId: 'study',
    title: 'Отличная оценка',
    comment: 'Получил 5 по математике за сложную контрольную.',
    author: 'Мама',
    timestamp: new Date().toISOString(),
    points: 10,
  },
  {
    id: 'e2',
    sphereId: 'focus',
    title: 'Отвлёкся от задачи',
    comment: 'Играл вместо выполнения домашнего задания.',
    author: 'Папа',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    points: -5,
  }
];
