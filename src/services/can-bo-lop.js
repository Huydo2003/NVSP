import { apiFetch } from './api';

export async function fetchCanBoLop() {
  return apiFetch('/api/can_bo_lop');
}

export async function createCanBoLop(payload) {
  return apiFetch('/api/can_bo_lop', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function updateCanBoLop(ma_sinh_vien, payload) {
  return apiFetch(`/api/can_bo_lop/${ma_sinh_vien}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function deleteCanBoLop(ma_sinh_vien) {
  return apiFetch(`/api/can_bo_lop/${ma_sinh_vien}`, {
    method: 'DELETE'
  });
}
