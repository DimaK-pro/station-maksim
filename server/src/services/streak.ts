import { calcDecayedSum, calcEnergy } from './energy';

interface EventForStreak {
  type: string;
  weight: number;
  createdAt: Date;
}

function getComparableEnergy(energy: number): number {
  return Math.round(energy);
}

function isEnergyInZone(energy: number, threshold: number, isPositive: boolean): boolean {
  const comparableEnergy = getComparableEnergy(energy);
  return isPositive ? comparableEnergy >= threshold : comparableEnergy <= threshold;
}

// Считает сколько consecutive дней подряд E был в зоне (выше/ниже порога)
export function calcStreakInfo(
  allEvents: EventForStreak[],
  threshold: number,
  k: number,
  isPositive: boolean, // true = выше порога (награда), false = ниже (последствие)
  maxDays = 30,
  decayCoeff = 1,
  today = new Date()
): { streak: number; startDate: Date | null } {
  const events = allEvents
    .filter((event) => event.createdAt <= today)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const currentSum = calcDecayedSum(events, { asOf: today, decayCoeff });
  const currentEnergy = calcEnergy(currentSum, k);
  const currentlyInZone = isEnergyInZone(currentEnergy, threshold, isPositive);

  if (!currentlyInZone) {
    return { streak: 0, startDate: null };
  }

  let startDate = events[0]?.createdAt ?? today;

  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    const beforeEvent = new Date(event.createdAt.getTime() - 1);
    const beforeSum = calcDecayedSum(events, { asOf: beforeEvent, decayCoeff });
    const beforeEnergy = calcEnergy(beforeSum, k);
    const wasInZone = isEnergyInZone(beforeEnergy, threshold, isPositive);

    if (!wasInZone) {
      startDate = event.createdAt;
      break;
    }
  }

  const heldDays = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)));
  const streak = Math.min(maxDays, heldDays);

  return { streak, startDate };
}
export function calcChestStatus(
  streak: number,
  spinsInStreak: number,
  thresholdDays: number[],
  isInZone = streak > 0,
  options: {
    energy?: number;
    energyThresholds?: number[];
    isPositive?: boolean;
  } = {}
): {
  status: 'locked' | 'countdown' | 'available' | 'completed';
  daysLeft: number | null;
  level: number | null;
  progress: number;
  maxProgress: number;
  progressType: 'energy' | 'days' | 'complete';
  requiredDays: number | null;
  energyRequired: number | null;
  energyLeft: number | null;
} {
  if (spinsInStreak >= thresholdDays.length) {
    return {
      status: 'completed',
      daysLeft: null,
      level: null,
      progress: 1,
      maxProgress: 1,
      progressType: 'complete',
      requiredDays: null,
      energyRequired: null,
      energyLeft: null,
    };
  }

  const nextLevelIdx = spinsInStreak;
  const nextLevel = nextLevelIdx + 1;
  const requiredDays = Math.max(0, thresholdDays[nextLevelIdx]);
  const energyRequired = options.energyThresholds?.[nextLevelIdx] ?? null;
  const energy = getComparableEnergy(options.energy ?? 0);
  const isPositive = options.isPositive ?? true;
  const energyLeft = energyRequired === null
    ? null
    : Math.max(0, Math.round((isPositive ? energyRequired - energy : energy - energyRequired) * 10) / 10);
  const energyThresholdReached = energyRequired !== null && energyLeft === 0;
  const effectiveInZone = isInZone || energyThresholdReached;

  if (!effectiveInZone) {
    const energyTarget = Math.max(1, Math.abs(energyRequired ?? 1));
    const energyProgress = energyRequired === null
      ? 0
      : isPositive
        ? Math.max(0, Math.min(energyTarget, energy))
        : Math.max(0, Math.min(energyTarget, Math.abs(Math.min(energy, 0))));

    return {
      status: 'locked',
      daysLeft: requiredDays,
      level: nextLevel,
      progress: energyProgress,
      maxProgress: energyTarget,
      progressType: 'energy',
      requiredDays,
      energyRequired,
      energyLeft,
    };
  }

  if (streak >= requiredDays) {
    const progressMax = requiredDays > 0 ? requiredDays : 1;
    return {
      status: 'available',
      daysLeft: 0,
      level: nextLevel,
      progress: progressMax,
      maxProgress: progressMax,
      progressType: 'days',
      requiredDays,
      energyRequired,
      energyLeft: 0,
    };
  }

  return {
    status: 'countdown',
    daysLeft: requiredDays - streak,
    level: nextLevel,
    progress: streak,
    maxProgress: requiredDays,
    progressType: 'days',
    requiredDays,
    energyRequired,
    energyLeft: 0,
  };
}
