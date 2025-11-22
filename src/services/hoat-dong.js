import { apiFetch } from './api';

export async function fetchHoatDong() {
  return apiFetch('/api/hoat_dong');
}

// get chi tiết hoạt động thi theo id_hd
export async function fetchHoatDongById(id_hd) {
  return apiFetch(`/api/hoat_dong/${id_hd}`);
}

export async function createHoatDong(payload) {
  return apiFetch('/api/hoat_dong', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateHoatDong(id_hd, payload) {
  return apiFetch(`/api/hoat_dong/${id_hd}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteHoatDong(id_hd) {
  return apiFetch(`/api/hoat_dong/${id_hd}`, {
    method: 'DELETE'
  });
}
