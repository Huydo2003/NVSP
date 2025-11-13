import { apiFetch } from './api';

export async function fetchBanToChuc() {
  return apiFetch('/api/ban_to_chuc');
}

export async function createBanToChuc(payload) {
  return apiFetch('/api/ban_to_chuc', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateBanToChuc(ma_giang_vien, payload) {
  return apiFetch(`/api/ban_to_chuc/${ma_giang_vien}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteBanToChuc(ma_giang_vien) {
  return apiFetch(`/api/ban_to_chuc/${ma_giang_vien}`, {
    method: 'DELETE'
  });
}
