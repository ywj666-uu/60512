const API_BASE = 'http://localhost:3000/api';

export async function fetchPerformers() {
  const res = await fetch(`${API_BASE}/performers`);
  if (!res.ok) throw new Error('Failed to fetch performers');
  return res.json();
}

export async function fetchCheerStats(performerId: string) {
  const res = await fetch(`${API_BASE}/cheers/stats/${performerId}`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}
