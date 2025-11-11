import { apiFetch } from './api';

export async function fetchRegistrations() {
  return apiFetch('/api/registrations');
}
