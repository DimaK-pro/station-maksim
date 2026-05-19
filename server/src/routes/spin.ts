import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import { verifyToken } from '../lib/auth';
import { getStationState } from '../services/station';
import { broadcast } from '../lib/sseClients';

export async function spinRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/spin 🔒 — крутануть барабан
  app.post<{ Body: { chestType: 'reward' | 'consequence' } }>(
    '/spin',
    async (request, reply) => {
      const { chestType } = request.body;

      if (!['reward', 'consequence'].includes(chestType)) {
        return reply.status(400).send({ error: 'chestType must be "reward" or "consequence"' });
      }

      // Получить текущий стейт, чтобы знать доступный уровень
      const state = await getStationState();
      const chestState = chestType === 'reward' ? state.rewardChest : state.consequenceChest;

      if (chestState.status !== 'available' || chestState.level === null) {
        return reply.status(403).send({ error: 'Chest is not available yet', status: chestState.status });
      }

      const level = chestState.level;

      // Случайно выбрать предмет нужного типа и уровня
      const items = await prisma.chestItem.findMany({
        where: { chestType, level },
      });

      if (items.length === 0) {
        return reply.status(404).send({ error: `No items in ${chestType} chest level ${level}` });
      }

      const winner = items[Math.floor(Math.random() * items.length)];

      // Сохранить результат
      const spinResult = await prisma.spinResult.create({
        data: {
          chestType,
          chestItemId: winner.id,
        },
        include: { chestItem: true },
      });

      // Broadcast new state so streak progress goes down
      const newState = await getStationState();
      broadcast(newState);

      return reply.status(201).send(spinResult);
    }
  );
}
