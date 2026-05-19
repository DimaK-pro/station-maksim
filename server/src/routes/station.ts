import { FastifyInstance } from 'fastify';
import { getStationState } from '../services/station';

export async function stationRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/station — публичный, Максим видит без входа
  app.get('/station', async (_request, reply) => {
    try {
      const state = await getStationState();
      return reply.send(state);
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Failed to get station state' });
    }
  });
}
