import { apiFetch } from './api';

export async function fetchSinhVien() {
  return apiFetch('/api/sinh_vien');
}

export async function fetchSinhVienById(ma_sinh_vien) {
  return apiFetch(`/api/sinh_vien/${ma_sinh_vien}`);
}

export async function createSinhVien(payload) {
  return apiFetch('/api/sinh_vien', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateSinhVien(ma_sinh_vien, payload) {
  return apiFetch(`/api/sinh_vien/${ma_sinh_vien}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteSinhVien(ma_sinh_vien) {
  return apiFetch(`/api/sinh_vien/${ma_sinh_vien}`, {
    method: 'DELETE'
  });
}
