import { apiFetch } from './api';

// Lấy toàn bộ ban giám khảo (ít dùng)
export async function fetchBanGiamKhao() {
  return apiFetch('/api/ban_giam_khao');
}

// Lấy danh sách BKG theo id hoạt động thi
export async function fetchBanGiamKhaoById(id_hd) {
  return apiFetch(`/api/ban_giam_khao/${id_hd}`);
}

// Thêm 1 giảng viên vào ban giám khảo
// payload phải có: { id_hd, ma_giang_vien }
export async function createBanGiamKhao(payload) {
  return apiFetch('/api/ban_giam_khao', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// Cập nhật bản ghi theo PK (id_hd + ma_giang_vien)
// body có thể chứa ma_giang_vien_moi nếu muốn đổi giảng viên
export async function updateBanGiamKhao(id_hd, ma_giang_vien, payload) {
  return apiFetch(`/api/ban_giam_khao/${id_hd}/${ma_giang_vien}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

// Xóa 1 giảng viên khỏi ban giám khảo
export async function deleteBanGiamKhao(id_hd, ma_giang_vien) {
  return apiFetch(`/api/ban_giam_khao/${id_hd}/${ma_giang_vien}`, {
    method: 'DELETE'
  });
}

// lấy thông tin hoạt động thi thông qua mã giảng viên
export async function fetchHoatDongThiByGiangVien(ma_giang_vien) {
  return apiFetch(`/api/ban_giam_khao/hoat_dong_thi/${ma_giang_vien}`);
}