/**
 * dang-ky-thi.js - Service for student exam/activity registration
 * Provides CRUD operations for dang_ky_thi (exam registration)
 */

import { apiFetch } from './api';

// Get all registrations (admin) or student's registrations
export async function fetchDangKyThi() {
  return apiFetch('/api/dang-ky-thi');
}

// Get registration by ID
export async function fetchDangKyThiById(id) {
  return apiFetch(`/api/dang-ky-thi/${id}`);
}

// Register for activity (individual or group leader)
export async function registerIndividual(id_hd) {
  return apiFetch('/api/dang-ky-thi', {
    method: 'POST',
    body: JSON.stringify({
      id_hd,
      hinh_thuc: 'Cá nhân'
    })
  });
}

// Create group registration (group leader)
export async function createGroupRegistration(id_hd, ten_nhom) {
  return apiFetch('/api/dang-ky-thi', {
    method: 'POST',
    body: JSON.stringify({
      id_hd,
      hinh_thuc: 'Nhóm',
      ten_nhom
    })
  });
}

// Join existing group
export async function joinGroup(id_hd, ma_tham_gia) {
  return apiFetch('/api/dang-ky-thi', {
    method: 'POST',
    body: JSON.stringify({
      id_hd,
      hinh_thuc: 'Nhóm',
      ma_tham_gia
    })
  });
}

// Update registration status (BTC/Admin only)
export async function updateDangKyThiStatus(id, trang_thai) {
  return apiFetch(`/api/dang-ky-thi/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ trang_thai })
  });
}

// Cancel registration
export async function cancelDangKyThi(id) {
  return apiFetch(`/api/dang-ky-thi/${id}`, {
    method: 'DELETE'
  });
}

// Get all registrations for BTC
export async function fetchAllDangKyThiBtc() {
  return apiFetch('/api/dang-ky-thi/btc/all');
}

// Get group members
export async function fetchThanhVienNhom(id_dang_ky) {
  return apiFetch(`/api/thanh-vien-nhom/${id_dang_ky}`);
}
