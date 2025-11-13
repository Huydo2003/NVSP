import { apiFetch } from './api';

export async function fetchUsers() {
  return apiFetch('/api/users');
}

export async function createUser(data) {
  // expected data: { ma_ca_nhan, ho_ten, mat_khau, loai_tk, email }
  return apiFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateUser(id, data) {
  // expected data: { ho_ten?, mat_khau?, loai_tk?, email? }
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

export async function changePassword(id, currentPassword, newPassword) {
  return apiFetch(`/api/users/${id}/change-password`, {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword })
  });
}

// Note: backend currently does not support a toggle-status endpoint for users.
// If you need to toggle a status flag, use updateUser with the appropriate field when DB supports it.// If you need to toggle a status flag, use updateUser with the appropriate field when DB supports it.}