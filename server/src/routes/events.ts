import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import { verifyToken } from '../lib/auth';
import { getStationState } from '../services/station';
import { broadcast } from '../lib/sseClients';

const ALLOWED_SPHERES = new Set(['study', 'respect', 'focus', 'home']);
const ALLOWED_EVENT_TYPES = new Set(['good', 'neutral', 'bad']);

export async function eventsRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/events — публичный, лента журнала
  app.get<{ Querystring: { type?: string; limit?: string } }>('/events', async (request, reply) => {
    const limit = parseInt(request.query.limit || '50');
    const type = request.query.type;

    if (type === 'spins') {
      const spins = await prisma.spinResult.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { chestItem: true },
      });
      return reply.send(spins);
    }

    const events = await prisma.event.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { role: true } } },
    });
    return reply.send(events);
  });

  // POST /api/events — добавить событие 🔒
  app.post<{ Body: { sphere: string; type: string; weight: number; comment?: string } }>(
    '/events',
    { preHandler: verifyToken },
    async (request, reply) => {
      const { sphere, type, weight, comment } = request.body;

      if (!sphere || !type || weight === undefined) {
        return reply.status(400).send({ error: 'sphere, type, weight are required' });
      }
      if (!ALLOWED_SPHERES.has(sphere)) {
        return reply.status(400).send({ error: 'Unknown sphere' });
      }
      if (!ALLOWED_EVENT_TYPES.has(type)) {
        return reply.status(400).send({ error: 'Unknown event type' });
      }
      if (!Number.isInteger(weight) || weight < -100 || weight > 100) {
        return reply.status(400).send({ error: 'weight must be an integer from -100 to 100' });
      }
      if (comment !== undefined && comment.length > 140) {
        return reply.status(400).send({ error: 'comment is too long' });
      }

      await prisma.event.create({
        data: {
          sphere,
          type,
          weight,
          comment,
          authorId: request.user!.userId,
        },
      });

      // Пересчитать стейт и broadcast через SSE
      const state = await getStationState();
      broadcast(state);

      return reply.status(201).send(state);
    }
  );

  // DELETE /api/events/:id — удалить событие 🔒
  app.delete<{ Params: { id: string } }>(
    '/events/:id',
    { preHandler: verifyToken },
    async (request, reply) => {
      const id = parseInt(request.params.id);

      const event = await prisma.event.findUnique({ where: { id } });
      if (!event) return reply.status(404).send({ error: 'Event not found' });

      await prisma.event.delete({ where: { id } });

      const state = await getStationState();
      broadcast(state);

      return reply.send(state);
    }
  );
}
