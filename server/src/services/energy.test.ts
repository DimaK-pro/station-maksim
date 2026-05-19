import { describe, it, expect } from 'vitest';
import { calcDecayedSum, calcEnergy, calcSpherePercent } from './energy';

describe('Energy Services', () => {
  const k = 30; // default curveK from settings

  describe('calcEnergy', () => {
    it('returns 0 when there are no events', () => {
      expect(calcEnergy(calcDecayedSum([]), k)).toBe(0);
    });

    it('returns positive energy for positive events', () => {
      const now = new Date('2026-05-18T12:00:00.000Z');
      const events = [
        { type: 'good', weight: 10, createdAt: now },
        { type: 'good', weight: 20, createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      ];
      const energy = calcEnergy(calcDecayedSum(events, { asOf: now }), k);
      expect(energy).toBeGreaterThan(0);
      expect(energy).toBe(46.2);
    });

    it('returns negative energy for negative events', () => {
      const now = new Date('2026-05-18T12:00:00.000Z');
      const events = [
        { type: 'bad', weight: -30, createdAt: now } 
      ];
      const energy = calcEnergy(calcDecayedSum(events, { asOf: now }), k);
      expect(energy).toBe(-46.2);
    });

    it('decays older events instead of dropping them abruptly', () => {
      const now = new Date('2026-05-18T12:00:00.000Z');
      const events = [
        { type: 'good', weight: 50, createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
        { type: 'good', weight: 10, createdAt: now },
      ];
      const decayedSum = calcDecayedSum(events, { asOf: now, decayCoeff: 0.9 });
      expect(decayedSum).toBeCloseTo(50.5, 5);
      expect(calcEnergy(decayedSum, k)).toBe(68.7);
    });
  });

  describe('calcSpherePercent', () => {
    it('returns 50.0 (neutral) when no events', () => {
      expect(calcSpherePercent(calcDecayedSum([]), k)).toBe(50.0);
    });

    it('calculates score based on isolated sphere events', () => {
      const now = new Date('2026-05-18T12:00:00.000Z');
      const events = [
        { type: 'good', sphere: 'study', weight: 30, createdAt: now },
        { type: 'bad', sphere: 'home', weight: -50, createdAt: now },
      ];
      
      const studyScore = calcSpherePercent(calcDecayedSum(events, { sphere: 'study', asOf: now }), k);
      // For study S=30 -> E=46.2 -> (46.2 + 100) / 2 = 73.1
      expect(studyScore).toBe(73.1);

      const homeScore = calcSpherePercent(calcDecayedSum(events, { sphere: 'home', asOf: now }), k);
      // For home S=-50 -> E = -68.2 -> (-68.2 + 100) / 2 = 15.9
      expect(homeScore).toBe(15.9);
    });
  });
});
