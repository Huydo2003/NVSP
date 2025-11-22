import { apiFetch } from './api';

export async function fetchSuKien() {
  return apiFetch('/api/su_kien');
}

// get chi tiết sự kiện theo id_sk
export async function fetchSuKienById(id_sk) {
  return apiFetch(`/api/su_kien/${id_sk}`);
}

export async function createSuKien({ ten_sk, nam_hoc }) {
  return apiFetch('/api/su_kien', {
    method: 'POST',
    body: JSON.stringify({ ten_sk, nam_hoc }),
  });
}

export async function updateSuKienStatus(id_sk, trang_thai) {
  return apiFetch(`/api/su_kien/${id_sk}`, {
    method: 'PUT',
    body: JSON.stringify({ trang_thai }),
  });
}

// Cập nhật sự kiện (tên, năm học, trạng thái)
export async function updateSuKien(id_sk, { ten_sk, nam_hoc, trang_thai }) {
  return apiFetch(`/api/su_kien/${id_sk}`, {
    method: 'PUT',
    body: JSON.stringify({ ten_sk, nam_hoc, trang_thai }),
  });
}

// Xóa sự kiện
export async function deleteSuKien(id_sk) {
  return apiFetch(`/api/su_kien/${id_sk}`, {
    method: 'DELETE',
  });
}