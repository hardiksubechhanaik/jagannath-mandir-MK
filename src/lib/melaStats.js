import { apiGet, apiPost, endpoints } from '../api/client';

export async function fetchMelaStats() {
  const data = await apiGet(endpoints.melaStats);
  return data.counts ?? {};
}

export function trackMelaInteraction(key) {
  apiPost(endpoints.melaStatsTrack(key), {}).catch(() => {});
}
