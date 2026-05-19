import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import { verifyToken } from '../lib/auth';
import { getStationState } from '../services/station';
import { broadcast } from '../lib/sseClients';

const ALLOWED_CHEST_TYPES = new Set(['reward', 'consequence']);

export async function chestsRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/chests — публичный, все предметы сундуков
  app.get('/chests', async (_request, reply) => {
    const items = await prisma.chestItem.findMany({ orderBy: [{ chestType: 'asc' }, { level: 'asc' }] });
    return reply.send(items);
  });

  // POST /api/chests — добавить предмет 🔒
  app.post<{ Body: { chestType: string; icon: string; level: number; title: string } }>(
    '/chests',
    { preHandler: verifyToken },
    async (request, reply) => {
      const { chestType, icon, level, title } = request.body;
      if (!ALLOWED_CHEST_TYPES.has(chestType)) {
        return reply.status(400).send({ error: 'Unknown chestType' });
      }
      if (!Number.isInteger(level) || level < 1 || level > 4) {
        return reply.status(400).send({ error: 'level must be from 1 to 4' });
      }
      if (!icon || icon.trim().length > 20) {
        return reply.status(400).send({ error: 'icon is required and must be short' });
      }
      if (!title || title.trim().length > 140) {
        return reply.status(400).send({ error: 'title is required and must be up to 140 chars' });
      }

      const item = await prisma.chestItem.create({
        data: { chestType, icon: icon.trim(), level, title: title.trim(), createdAt: new Date() },
      });
      const state = await getStationState();
      broadcast(state);
      return reply.status(201).send(item);
    }
  );

  // DELETE /api/chests/:id — удалить предмет 🔒
  app.delete<{ Params: { id: string } }>(
    '/chests/:id',
    { preHandler: verifyToken },
    async (request, reply) => {
      const id = parseInt(request.params.id);
      const item = await prisma.chestItem.findUnique({ where: { id } });
      if (!item) return reply.status(404).send({ error: 'ChestItem not found' });

      const spinsCount = await prisma.spinResult.count({ where: { chestItemId: id } });
      if (spinsCount > 0) {
        return reply.status(409).send({ error: 'ChestItem is already used in spin history' });
      }

      await prisma.chestItem.delete({ where: { id } });
      const state = await getStationState();
      broadcast(state);
      return reply.status(204).send();
    }
  );
}
