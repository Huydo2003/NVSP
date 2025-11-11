import { apiFetch } from './api';

export async function fetchCompetitions() {
  return apiFetch('/api/competitions');
}
