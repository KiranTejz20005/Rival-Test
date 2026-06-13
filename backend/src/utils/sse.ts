import { Response } from 'express';

interface SSEClient {
  id: string;
  userId: string;
  res: Response;
}

const clients: SSEClient[] = [];

export function addClient(id: string, userId: string, res: Response) {
  const client: SSEClient = { id, userId, res };
  clients.push(client);

  res.on('close', () => {
    const idx = clients.indexOf(client);
    if (idx !== -1) clients.splice(idx, 1);
  });
}

export function broadcast(event: string, data: unknown, targetUserId?: string) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach(client => {
    if (!targetUserId || client.userId === targetUserId) {
      client.res.write(message);
    }
  });
}
