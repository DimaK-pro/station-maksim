import { describe, expect, it } from 'vitest';
import { calcChestStatus, calcStreakInfo } from './streak';

describe('Streak Services', () => {
  const k = 30;
  const today = new Date('2026-05-18T12:00:00.000Z');

  it('counts consecutive positive days using end-of-day historical energy', () => {
    const events = [
      { type: 'good', weight: 50, createdAt: new Date('2026-05-16T10:00:00.000Z') },
    ];

    const result = calcStreakInfo(events, 50, k, true, 30, 1, today);

    expect(result.streak).toBe(2);
    expect(result.startDate?.toISOString()).toBe('2026-05-16T10:00:00.000Z');
  });

  it('resets positive streak when decay drops energy below threshold', () => {
    const events = [
      { type: 'good', weight: 50, createdAt: new Date('2026-05-16T10:00:00.000Z') },
    ];

    const result = calcStreakInfo(events, 50, k, true, 30, 0.5, today);

    expect(result.streak).toBe(0);
    expect(result.startDate).toBeNull();
  });

  it('counts consecutive negative days for consequence streaks', () => {
    const events = [
      { type: 'bad', weight: -50, createdAt: new Date('2026-05-17T10:00:00.000Z') },
    ];

    const result = calcStreakInfo(events, -50, k, false, 30, 1, today);

    expect(result.streak).toBe(1);
    expect(result.startDate?.toISOString()).toBe('2026-05-17T10:00:00.000Z');
  });

  it('marks the next chest level as available only after the required streak', () => {
    expect(calcChestStatus(0, 0, [1, 7, 14, 30])).toMatchObject({
      status: 'locked',
      level: 1,
    });

    expect(calcChestStatus(3, 1, [1, 7, 14, 30])).toMatchObject({
      status: 'countdown',
      level: 2,
      daysLeft: 4,
    });

    expect(calcChestStatus(7, 1, [1, 7, 14, 30])).toMatchObject({
      status: 'available',
      level: 2,
    });

    expect(calcChestStatus(30, 4, [1, 7, 14, 30])).toMatchObject({
      status: 'completed',
      level: null,
    });
  });

  it('locks the next chest level until its own energy threshold is reached', () => {
    expect(calcChestStatus(0, 1, [0, 7, 14, 30], false, {
      energy: 62,
      energyThresholds: [50, 70, 85, 95],
      isPositive: true,
    })).toMatchObject({
      status: 'locked',
      level: 2,
      energyRequired: 70,
      energyLeft: 8,
      progressType: 'energy',
    });
  });

  it('counts days for the next chest level after its own energy threshold is reached', () => {
    expect(calcChestStatus(3, 1, [0, 7, 14, 30], true, {
      energy: 75,
      energyThresholds: [50, 70, 85, 95],
      isPositive: true,
    })).toMatchObject({
      status: 'countdown',
      level: 2,
      daysLeft: 4,
      requiredDays: 7,
      energyRequired: 70,
      progressType: 'days',
    });
  });

  it('makes zero-day chests available immediately when energy is in zone', () => {
    expect(calcChestStatus(0, 0, [0, 7, 14, 30], true)).toMatchObject({
      status: 'available',
      level: 1,
      daysLeft: 0,
    });
  });

  it('uses the displayed rounded energy when checking chest thresholds', () => {
    const events = [
      { type: 'good', weight: 15, createdAt: new Date('2026-05-18T10:00:00.000Z') },
    ];

    const result = calcStreakInfo(events, 25, k, true, 30, 1, today);

    expect(result.startDate?.toISOString()).toBe('2026-05-18T10:00:00.000Z');
  });

  it('opens a zero-day chest when displayed energy reaches the level threshold', () => {
    expect(calcChestStatus(0, 0, [0, 7, 14, 30], false, {
      energy: 24.6,
      energyThresholds: [25, 50, 75, 90],
      isPositive: true,
    })).toMatchObject({
      status: 'available',
      level: 1,
      daysLeft: 0,
    });
  });

  it('keeps zero-day chests locked when energy is outside the zone', () => {
    expect(calcChestStatus(0, 0, [0, 7, 14, 30], false)).toMatchObject({
      status: 'locked',
      level: 1,
    });
  });

  it('starts a new zone session from the latest threshold crossing event', () => {
    const events = [
      { type: 'good', weight: 50, createdAt: new Date('2026-05-18T08:00:00.000Z') },
      { type: 'bad', weight: -50, createdAt: new Date('2026-05-18T09:00:00.000Z') },
      { type: 'good', weight: 50, createdAt: new Date('2026-05-18T10:00:00.000Z') },
    ];

    const result = calcStreakInfo(events, 50, k, true, 30, 1, today);

    expect(result.streak).toBe(0);
    expect(result.startDate?.toISOString()).toBe('2026-05-18T10:00:00.000Z');
  });
});
