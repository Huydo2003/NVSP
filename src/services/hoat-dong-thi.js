import { apiFetch } from './api';

export async function fetchHoatDongThi() {
  return apiFetch('/api/hoat_dong_thi');
}

// get chi tiết hoạt động thi theo id_hd
export async function fetchHoatDongThiById(id_hd) {
  return apiFetch(`/api/hoat_dong_thi/${id_hd}`);
}

export async function createHoatDongThi(payload) {
  return apiFetch('/api/hoat_dong_thi', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateHoatDongThi(id_hd, payload) {
  return apiFetch(`/api/hoat_dong_thi/${id_hd}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteHoatDongThi(id_hd) {
  return apiFetch(`/api/hoat_dong_thi/${id_hd}`, {
    method: 'DELETE'
  });
}
