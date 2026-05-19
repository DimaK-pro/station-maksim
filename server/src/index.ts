import Fastify from 'fastify';
import { authRoutes } from './routes/auth';
import { stationRoutes } from './routes/station';
import { eventsRoutes } from './routes/events';
import { chestsRoutes } from './routes/chests';
import { spinRoutes } from './routes/spin';
import { settingsRoutes } from './routes/settings';
import { sseRoutes } from './routes/sse';
import { setupCronJobs } from './jobs/decay';

const app = Fastify({ logger: true });

// CORS could be added here if frontend is on a different port during dev
app.register(import('@fastify/cors'), {
  origin: true, // For dev, allow all
});

app.register(async (api) => {
  api.register(authRoutes, { prefix: '/auth' });
  api.register(stationRoutes);
  api.register(eventsRoutes);
  api.register(chestsRoutes);
  api.register(spinRoutes);
  api.register(settingsRoutes);
  api.register(sseRoutes);
}, { prefix: '/api' });

const start = async () => {
  try {
    setupCronJobs();
    
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening at http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
