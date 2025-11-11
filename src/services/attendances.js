import { apiFetch } from './api';

export async function fetchAttendances() {
  return apiFetch('/api/attendances');
}
