import jwt from 'jsonwebtoken';
import { FastifyRequest, FastifyReply } from 'fastify';

export interface JWTPayload {
  userId: number;
  role: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload;
  }
}

export async function verifyToken(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const auth = request.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as JWTPayload;
    request.user = payload;
  } catch {
    return reply.status(401).send({ error: 'Invalid token' });
  }
}

export async function requirePapa(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await verifyToken(request, reply);
  if (request.user?.role !== 'papa') {
    return reply.status(403).send({ error: 'Forbidden: only papa can do this' });
  }
}
