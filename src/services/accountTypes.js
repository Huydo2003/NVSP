import { apiFetch } from './api';

export async function fetchAccountTypes() {
  return apiFetch('/api/account-types');
}

export async function createAccountType(data) {
  return apiFetch('/api/account-types', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateAccountType(id, data) {
  return apiFetch(`/api/account-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteAccountType(id) {
  return apiFetch(`/api/account-types/${id}`, {
    method: 'DELETE'
  });
}
