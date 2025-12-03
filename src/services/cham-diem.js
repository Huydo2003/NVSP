import { apiFetch } from './api';

// Lấy toàn bộ chấm điểm
export async function fetchChamDiem() {
  return apiFetch('/api/cham_diem');
}

// Lấy chấm điểm theo hoạt động thi
export async function fetchChamDiemByActivity(id_hd) {
  return apiFetch(`/api/cham_diem/activity/${id_hd}`);
}

// Thêm/chỉnh sửa chấm điểm
export async function upsertChamDiem(payload) {
    return apiFetch('/api/cham_diem', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

// Xóa chấm điểm theo ID
export async function deleteChamDiem(id) {
    return apiFetch(`/api/cham_diem/${id}`, {
        method: 'DELETE'
    });
}