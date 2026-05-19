import { FastifyInstance } from 'fastify';
import { addClient, removeClient } from '../lib/sseClients';

export async function sseRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/sse/station
  app.get('/sse/station', (request, reply) => {
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    
    // We send headers but don't close the connection
    reply.raw.flushHeaders();

    addClient(reply.raw);

    // Initial ping to keep connection alive
    reply.raw.write(': connected\n\n');

    request.raw.on('close', () => {
      removeClient(reply.raw);
    });
  });
}
