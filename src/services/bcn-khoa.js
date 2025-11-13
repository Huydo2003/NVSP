import { apiFetch } from './api';

export const fetchBcnKhoa = async () => {
  try {
    return await apiFetch('/api/bcn_khoa');
  } catch (err) {
    console.error('fetchBcnKhoa error:', err);
    return [];
  }
};

export const fetchGiangVien = async () => {
  try {
    return await apiFetch('/api/giang-vien');
  } catch (err) {
    console.error('fetchGiangVien error:', err);
    return [];
  }
};

export const createBcnKhoa = async (data) => {
  try {
    return await apiFetch('/api/bcn_khoa', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('createBcnKhoa error:', err);
    throw err;
  }
};

export const updateBcnKhoa = async (id, data) => {
  try {
    return await apiFetch(`/api/bcn_khoa/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('updateBcnKhoa error:', err);
    throw err;
  }
};

export const deleteBcnKhoa = async (id) => {
  try {
    return await apiFetch(`/api/bcn_khoa/${id}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.error('deleteBcnKhoa error:', err);
    throw err;
  }
};
