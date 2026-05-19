import { ServerResponse } from 'http';

// Множество активных SSE-соединений
const clients = new Set<ServerResponse>();

export function addClient(res: ServerResponse): void {
  clients.add(res);
}

export function removeClient(res: ServerResponse): void {
  clients.delete(res);
}

export function broadcast(data: unknown): void {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      client.write(message);
    } catch {
      clients.delete(client);
    }
  }
}
