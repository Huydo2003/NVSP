import { apiFetch } from './api';

export async function registerDkiThamDu(id_hd) {
  return apiFetch('/api/dki-tham-du', {
    method: 'POST',
    body: JSON.stringify({ id_hd })
  });
}

export async function fetchDkiThamDu() {
  return apiFetch('/api/dki-tham-du');
}

export async function fetchDkiThamDuClass() {
  return apiFetch('/api/dki-tham-du/class');
}

export async function updateDkiThamDuStatus(ma_sv, id_hd, trang_thai) {
  return apiFetch(`/api/dki-tham-du/${ma_sv}/${id_hd}`, {
    method: 'PUT',
    body: JSON.stringify({ trang_thai })
  });
}

export async function cancelDkiThamDu(ma_sv, id_hd) {
  return apiFetch(`/api/dki-tham-du/${ma_sv}/${id_hd}`, {
    method: 'DELETE'
  });
}
