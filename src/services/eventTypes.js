import { apiFetch } from './api';

export async function fetchEventTypes() {
  return apiFetch('/api/event-types');
}

export async function createEventType(data) {
  return apiFetch('/api/event-types', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateEventType(id, data) {
  return apiFetch(`/api/event-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteEventType(id) {
  return apiFetch(`/api/event-types/${id}`, {
    method: 'DELETE'
  });
}
