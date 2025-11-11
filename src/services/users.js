import { apiFetch } from './api';

export async function fetchUsers() {
  return apiFetch('/api/users');
}

export async function createUser(data) {
  return apiFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateUser(id, data) {
  return apiFetch(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteUser(id) {
  return apiFetch(`/api/users/${id}`, {
    method: 'DELETE'
  });
}

export async function toggleUserStatus(id) {
  return apiFetch(`/api/users/${id}/toggle-status`, {
    method: 'POST'
  });
}