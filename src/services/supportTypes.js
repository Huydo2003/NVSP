import { apiFetch } from './api';

export async function fetchSupportTypes() {
  return apiFetch('/api/support-types');
}

export async function createSupportType(data) {
  return apiFetch('/api/support-types', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateSupportType(id, data) {
  return apiFetch(`/api/support-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteSupportType(id) {
  return apiFetch(`/api/support-types/${id}`, {
    method: 'DELETE'
  });
}
