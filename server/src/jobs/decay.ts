import cron from 'node-cron';
import { getStationState } from '../services/station';
import { broadcast } from '../lib/sseClients';

export function setupCronJobs(): void {
  // Каждый день в 00:00 обновляем открытые клиенты.
  // Сам decay считается на лету по возрасту событий, без системных записей в БД.
  cron.schedule('0 0 * * *', async () => {
    try {
      const state = await getStationState();
      broadcast(state);
    } catch (err) {
      console.error('Decay cron job failed:', err);
    }
  });
}
