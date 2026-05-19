export function calcEnergy(sumS: number, k: number): number {
  // Логистическая кривая: строго между -100 и +100
  const E = (200 / (1 + Math.exp(-sumS / k))) - 100;
  return Math.round(E * 10) / 10;
}

export function calcSpherePercent(sumS: number, k: number): number {
  // Та же кривая, но переведённая в проценты 0–100
  // 0 баллов → 50%, положительные → выше 50%, отрицательные → ниже 50%
  const E = calcEnergy(sumS, k);
  return Math.round(((E + 100) / 2) * 10) / 10;
}

export function calcDecayedSum(
  events: { weight: number; createdAt: Date; sphere?: string }[],
  options: {
    sphere?: string;
    decayCoeff?: number;
    asOf?: Date;
  } = {}
): number {
  const asOf = options.asOf ?? new Date();
  const decayCoeff = options.decayCoeff && options.decayCoeff > 0 && options.decayCoeff <= 1
    ? options.decayCoeff
    : 1;
  const msInDay = 24 * 60 * 60 * 1000;

  return events
    .filter(e => e.createdAt <= asOf)
    .filter(e => !options.sphere || e.sphere === options.sphere)
    .reduce((sum, e) => {
      const ageDays = Math.max(0, (asOf.getTime() - e.createdAt.getTime()) / msInDay);
      return sum + e.weight * Math.pow(decayCoeff, ageDays);
    }, 0);
}
