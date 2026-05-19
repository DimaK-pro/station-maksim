import prisma from '../lib/prisma';
import { calcDecayedSum, calcEnergy, calcSpherePercent } from './energy';
import { calcStreakInfo, calcChestStatus } from './streak';

const SPHERES = ['study', 'respect', 'focus', 'home'] as const;

function parseNumberList(value: string | null | undefined, fallback: number[]): number[] {
  if (!value) return fallback;
  const parsed = value.split(',').map((item) => Number(item.trim()));
  return parsed.length === fallback.length && parsed.every(Number.isFinite) ? parsed : fallback;
}

// Главная функция — возвращает полный стейт станции
export async function getStationState() {
  const [events, settings, chestItems] = await Promise.all([
    prisma.event.findMany({ 
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { role: true } } }
    }),
    prisma.settings.findUnique({ where: { id: 1 } }),
    prisma.chestItem.findMany({ orderBy: [{ chestType: 'asc' }, { level: 'asc' }, { createdAt: 'asc' }] }),
  ]);

  if (!settings) throw new Error('Settings not initialized. Run seed first.');

  const k = settings.curveK ?? 30;
  const decayCoeff = settings.decayCoeff ?? 1;

  // ПУЛ 1: Энергия — ВСЕ события с учетом временного затухания
  const S_total = calcDecayedSum(events, { decayCoeff });
  const energy = calcEnergy(S_total, k);

  // ПУЛЫ 2–5: Каждая сфера — только свои события с тем же decay
  const spheres: Record<string, number> = {};
  for (const sphere of SPHERES) {
    spheres[sphere] = calcSpherePercent(calcDecayedSum(events, { sphere, decayCoeff }), k);
  }

  const rewardDays = parseNumberList(settings.rewardDays, [1, 7, 14, 30]);
  const consequenceDays = parseNumberList(settings.consequenceDays, [1, 3, 7, 14]);
  const rewardEnergyThresholds = parseNumberList(settings.rewardEnergyThresholds, [50, 50, 50, 50]);
  const consequenceEnergyThresholds = parseNumberList(settings.consequenceEnergyThresholds, [-50, -50, -50, -50]);

  const { startDate: rewardBaseStartDate } = calcStreakInfo(
    events, rewardEnergyThresholds[0], settings.curveK, true, 30, decayCoeff
  );
  const { startDate: consequenceBaseStartDate } = calcStreakInfo(
    events, consequenceEnergyThresholds[0], settings.curveK, false, 30, decayCoeff
  );

  let rewardSpinsInStreak = 0;
  if (rewardBaseStartDate) {
    rewardSpinsInStreak = await prisma.spinResult.count({
      where: {
        chestType: 'reward',
        createdAt: { gte: rewardBaseStartDate }
      }
    });
  }

  let consequenceSpinsInStreak = 0;
  if (consequenceBaseStartDate) {
    consequenceSpinsInStreak = await prisma.spinResult.count({
      where: {
        chestType: 'consequence',
        createdAt: { gte: consequenceBaseStartDate }
      }
    });
  }

  const rewardNextLevelIndex = Math.min(rewardSpinsInStreak, rewardDays.length - 1);
  const consequenceNextLevelIndex = Math.min(consequenceSpinsInStreak, consequenceDays.length - 1);

  const { streak: rewardStreak, startDate: rewardLevelStartDate } = calcStreakInfo(
    events, rewardEnergyThresholds[rewardNextLevelIndex], settings.curveK, true, 30, decayCoeff
  );
  const { streak: consequenceStreak, startDate: consequenceLevelStartDate } = calcStreakInfo(
    events, consequenceEnergyThresholds[consequenceNextLevelIndex], settings.curveK, false, 30, decayCoeff
  );

  return {
    energy,
    spheres,
    thresholdPlus: settings.thresholdPlus,
    thresholdMinus: settings.thresholdMinus,
    rewardEnergyThresholds,
    consequenceEnergyThresholds,
    weightsGood: settings.weightsGood.split(',').map(Number),
    weightsNeutral: settings.weightsNeutral.split(',').map(Number),
    weightsBad: settings.weightsBad.split(',').map(Number),
    rewardChest: calcChestStatus(rewardStreak, rewardSpinsInStreak, rewardDays, rewardLevelStartDate !== null, {
      energy,
      energyThresholds: rewardEnergyThresholds,
      isPositive: true,
    }),
    consequenceChest: calcChestStatus(consequenceStreak, consequenceSpinsInStreak, consequenceDays, consequenceLevelStartDate !== null, {
      energy,
      energyThresholds: consequenceEnergyThresholds,
      isPositive: false,
    }),
    chestItems,
    recentEvents: events.slice(-50).reverse(), // Send top 50 recent events
  };
}
