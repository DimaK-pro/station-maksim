// API wrapper for frontend
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

export const api = {
  getStation: async () => {
    const res = await fetch(`${API_URL}/station`);
    if (!res.ok) throw new Error('Failed to fetch station');
    return res.json();
  },
  getEvents: async (type = 'events', limit = 50) => {
    const res = await fetch(`${API_URL}/events?type=${type}&limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },
  addEvent: async (token: string, eventData: { sphere: string; type: string; weight: number; comment?: string }) => {
    const res = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(eventData)
    });
    if (!res.ok) throw new Error('Failed to add event');
    return res.json();
  },
  deleteEvent: async (token: string, id: string) => {
    const res = await fetch(`${API_URL}/events/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to delete event');
    return res.json();
  },
  updateSpinCompleted: async (token: string, id: string, completed: boolean) => {
    const res = await fetch(`${API_URL}/events/spins/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ completed })
    });
    if (!res.ok) throw new Error('Failed to update spin result');
    return res.json();
  },
  login: async (role: string, pin: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, pin })
    });
    if (!res.ok) throw new Error('Failed to login');
    return res.json();
  },
  updatePin: async (token: string, data: { role: string; oldPin?: string; newPin: string }) => {
    const res = await fetch(`${API_URL}/auth/pin`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update PIN');
    return res.json();
  },
  spin: async (chestType: 'reward' | 'consequence') => {
    const res = await fetch(`${API_URL}/spin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ chestType })
    });
    if (!res.ok) throw new Error('Failed to spin');
    return res.json();
  },
  getChests: async () => {
    const res = await fetch(`${API_URL}/chests`);
    if (!res.ok) throw new Error('Failed to fetch chests');
    return res.json();
  },
  addChestItem: async (token: string, data: { chestType: string; icon: string; level: number; title: string }) => {
    const res = await fetch(`${API_URL}/chests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add chest item');
    return res.json();
  },
  deleteChestItem: async (token: string, id: string) => {
    const res = await fetch(`${API_URL}/chests/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to delete chest item');
    return;
  },
  getSettings: async (token: string) => {
    const res = await fetch(`${API_URL}/settings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },
  updateSettings: async (token: string, data: any) => {
    const res = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  }
};
