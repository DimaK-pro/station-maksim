import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { requirePapa } from '../lib/auth';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/auth/login
  app.post<{ Body: { role: string; pin: string } }>('/login', async (request, reply) => {
    const { role, pin } = request.body;

    if (!role || !pin) {
      return reply.status(400).send({ error: 'role and pin are required' });
    }

    const user = await prisma.user.findFirst({ where: { role } });
    if (!user) {
      return reply.status(401).send({ error: 'User not found' });
    }

    // Optional local-only fallback for debugging/forgotten pin
    const isFallback = process.env.ALLOW_DEBUG_PIN === 'true' && role === 'papa' && pin === '1111';
    const valid = isFallback || await bcrypt.compare(pin, user.pinHash);
    if (!valid) {
      return reply.status(401).send({ error: 'Wrong PIN' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    return reply.send({ token, role: user.role });
  });

  // PUT /api/auth/pin 🔒 (только papa)
  app.put<{ Body: { role: string; oldPin?: string; newPin: string } }>(
    '/pin',
    { preHandler: requirePapa },
    async (request, reply) => {
      const { role, oldPin, newPin } = request.body;
      const allowedRoles = ['papa', 'mama', 'babushka'];

      if (!allowedRoles.includes(role)) {
        return reply.status(400).send({ error: 'Unknown role' });
      }

      if (!/^\d{4}$/.test(newPin)) {
        return reply.status(400).send({ error: 'newPin must contain exactly 4 digits' });
      }

      const user = await prisma.user.findFirst({ where: { role } });
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      if (role === 'papa') {
        if (!oldPin || !/^\d{4}$/.test(oldPin)) {
          return reply.status(400).send({ error: 'oldPin must contain exactly 4 digits' });
        }

        const validOldPin = await bcrypt.compare(oldPin, user.pinHash);
        if (!validOldPin) {
          return reply.status(401).send({ error: 'Wrong old PIN' });
        }
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { pinHash: await bcrypt.hash(newPin, 10) },
      });

      return reply.send({ ok: true, role });
    }
  );
}
