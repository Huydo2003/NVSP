import { apiFetch } from './api';

export async function fetchDiemDanh() {
  return apiFetch('/api/diem-danh');
}

// accept optional ma_sv
export async function registerDiemDanh(id_hd_tham_du, anh_minh_chung, ma_sv) {
  const body = { id_hd_tham_du, anh_minh_chung };
  if (ma_sv) body.ma_sv = ma_sv;
  return apiFetch('/api/diem-danh', {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

export async function cancelDiemDanh(id) {
  return apiFetch(`/api/diem-danh/${id}`, {
    method: 'DELETE'
  });
}
