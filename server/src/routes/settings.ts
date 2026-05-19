import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import { requirePapa } from '../lib/auth';
import { getStationState } from '../services/station';
import { broadcast } from '../lib/sseClients';

const SETTINGS_KEYS = new Set([
  'curveK',
  'decayCoeff',
  'thresholdPlus',
  'thresholdMinus',
  'weightsGood',
  'weightsNeutral',
  'weightsBad',
  'rewardDays',
  'consequenceDays',
  'rewardEnergyThresholds',
  'consequenceEnergyThresholds',
]);

function parseNumberList(value: string, expectedLength: number): number[] | null {
  const parts = value.split(',').map((part) => part.trim());
  if (parts.length !== expectedLength) return null;
  const values = parts.map(Number);
  return values.every(Number.isFinite) ? values : null;
}

function isNumberList(value: string, expectedLength: number): boolean {
  return parseNumberList(value, expectedLength) !== null;
}

function isIntegerListInRange(value: string, expectedLength: number, min: number, max: number): boolean {
  const values = parseNumberList(value, expectedLength);
  return values !== null && values.every((item) => Number.isInteger(item) && item >= min && item <= max);
}

export async function settingsRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/settings 🔒 (только papa)
  app.get('/settings', { preHandler: requirePapa }, async (_request, reply) => {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!settings) return reply.status(404).send({ error: 'Settings not found' });
    return reply.send(settings);
  });

  // PUT /api/settings 🔒 (только papa)
  app.put<{ Body: Partial<{
    curveK: number;
    decayCoeff: number;
    thresholdPlus: number;
    thresholdMinus: number;
    weightsGood: string;
    weightsNeutral: string;
    weightsBad: string;
    rewardDays: string;
    consequenceDays: string;
    rewardEnergyThresholds: string;
    consequenceEnergyThresholds: string;
  }> }>('/settings', { preHandler: requirePapa }, async (request, reply) => {
    for (const key of Object.keys(request.body)) {
      if (!SETTINGS_KEYS.has(key)) {
        return reply.status(400).send({ error: `Unknown setting: ${key}` });
      }
    }

    const {
      curveK,
      decayCoeff,
      thresholdPlus,
      thresholdMinus,
      weightsGood,
      weightsNeutral,
      weightsBad,
      rewardDays,
      consequenceDays,
      rewardEnergyThresholds,
      consequenceEnergyThresholds,
    } = request.body;

    if (curveK !== undefined && (!Number.isFinite(curveK) || curveK < 1 || curveK > 200)) {
      return reply.status(400).send({ error: 'curveK must be from 1 to 200' });
    }
    if (decayCoeff !== undefined && (!Number.isFinite(decayCoeff) || decayCoeff <= 0 || decayCoeff > 1)) {
      return reply.status(400).send({ error: 'decayCoeff must be greater than 0 and up to 1' });
    }
    if (thresholdPlus !== undefined && (!Number.isInteger(thresholdPlus) || thresholdPlus <= 0 || thresholdPlus > 100)) {
      return reply.status(400).send({ error: 'thresholdPlus must be from 1 to 100' });
    }
    if (thresholdMinus !== undefined && (!Number.isInteger(thresholdMinus) || thresholdMinus < -100 || thresholdMinus >= 0)) {
      return reply.status(400).send({ error: 'thresholdMinus must be from -100 to -1' });
    }
    if (weightsGood !== undefined && !isNumberList(weightsGood, 5)) {
      return reply.status(400).send({ error: 'weightsGood must contain 5 numbers' });
    }
    if (weightsNeutral !== undefined && !isNumberList(weightsNeutral, 5)) {
      return reply.status(400).send({ error: 'weightsNeutral must contain 5 numbers' });
    }
    if (weightsBad !== undefined && !isNumberList(weightsBad, 5)) {
      return reply.status(400).send({ error: 'weightsBad must contain 5 numbers' });
    }
    if (rewardDays !== undefined && !isNumberList(rewardDays, 4)) {
      return reply.status(400).send({ error: 'rewardDays must contain 4 numbers' });
    }
    if (consequenceDays !== undefined && !isNumberList(consequenceDays, 4)) {
      return reply.status(400).send({ error: 'consequenceDays must contain 4 numbers' });
    }
    if (rewardDays !== undefined && !isIntegerListInRange(rewardDays, 4, 0, 365)) {
      return reply.status(400).send({ error: 'rewardDays must contain 4 whole numbers from 0 to 365' });
    }
    if (consequenceDays !== undefined && !isIntegerListInRange(consequenceDays, 4, 0, 365)) {
      return reply.status(400).send({ error: 'consequenceDays must contain 4 whole numbers from 0 to 365' });
    }
    if (rewardEnergyThresholds !== undefined && !isIntegerListInRange(rewardEnergyThresholds, 4, 0, 100)) {
      return reply.status(400).send({ error: 'rewardEnergyThresholds must contain 4 whole numbers from 0 to 100' });
    }
    if (consequenceEnergyThresholds !== undefined && !isIntegerListInRange(consequenceEnergyThresholds, 4, -100, 0)) {
      return reply.status(400).send({ error: 'consequenceEnergyThresholds must contain 4 whole numbers from -100 to 0' });
    }

    const settings = await prisma.settings.update({
      where: { id: 1 },
      data: request.body,
    });
    const state = await getStationState();
    broadcast(state);
    return reply.send(settings);
  });
}
