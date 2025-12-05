import { apiFetch } from './api';

// GET toàn bộ giấy chứng nhận
export const fetchGiayChungNhanAll = () => {
  return apiFetch('/api/giay_chung_nhan');
};

// Thêm hoặc cập nhật (upsert)
export const upsertGiayChungNhan = (data) => {
  return apiFetch('/api/giay_chung_nhan', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// Xóa theo id_dang_ky
export const deleteGiayChungNhan = (id_dang_ky) => {
  return apiFetch(`/api/giay_chung_nhan/${id_dang_ky}`, {
    method: 'DELETE'
  });
}
