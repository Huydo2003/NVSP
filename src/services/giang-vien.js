/**
 * giang-vien.js - Service for giảng viên (teacher) API
 * 
 * Provides CRUD operations for giảng viên management
 */

import { apiFetch } from './api';

export async function fetchGiangVien() {
  return apiFetch('/api/giang-vien');
}

export async function fetchGiangVienById(ma_giang_vien) {
  return apiFetch(`/api/giang_vien/${ma_giang_vien}`);
}

export async function createGiangVien(payload) {
  return apiFetch('/api/giang_vien', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateGiangVien(ma_giang_vien, payload) {
  return apiFetch(`/api/giang_vien/${ma_giang_vien}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteGiangVien(ma_giang_vien) {
  return apiFetch(`/api/giang_vien/${ma_giang_vien}`, {
    method: 'DELETE'
  });
}
