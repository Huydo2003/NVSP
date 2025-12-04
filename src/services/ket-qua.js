// src/services/ket-qua.js
import { apiFetch } from './api';

// GET toàn bộ kết quả
export const fetchKetQuaAll = () => {
  return apiFetch('/api/ket_qua');
};

// Thêm hoặc cập nhật (upsert)
export const upsertKetQua = (data) => {
  return apiFetch('/api/ket_qua', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// Xóa theo id_dang_ky
export const deleteKetQua = (id_dang_ky) => {
  return apiFetch(`/api/ket_qua/${id_dang_ky}`, {
    method: 'DELETE'
  });
};
