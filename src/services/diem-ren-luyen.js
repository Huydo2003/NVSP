import { apiFetch } from './api';

// GET tất cả điểm rèn luyện
export const fetchDiemRenLuyenAll = () => {
  return apiFetch('/api/diem_ren_luyen');
};

// GET điểm rèn luyện theo ma_sv
export const fetchDiemRenLuyenBySinhVien = (maSv) => {
  return apiFetch(`/api/diem_ren_luyen/sinh_vien/${maSv}`);
};

// GET điểm rèn luyện theo năm học
export const fetchDiemRenLuyenByNamHoc = (namHoc) => {
  return apiFetch(`/api/diem_ren_luyen/nam_hoc/${namHoc}`);
};

// Xử lý và tính điểm rèn luyện từ danh sách tham dự và kết quả
export const processDiemRenLuyen = (data) => {
  return apiFetch('/api/diem_ren_luyen/process', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// Xuất file Excel theo lớp - khoa (download file trực tiếp)
export const exportDiemRenLuyenExcel = async (filters = {}) => {
  const token = localStorage.getItem('nvsp_token');
  
  // Determine API base
  const envBase = window.__NVSP_API_BASE__ || (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || '';
  const fallbackBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:4000' : '';
  const apiBase = envBase || fallbackBase;
  
  const queryString = new URLSearchParams(filters).toString();
  const url = `${apiBase}/api/diem_ren_luyen/export/excel${queryString ? '?' + queryString : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream'
    }
  });

  if (!response.ok) {
    let errorMsg = `HTTP error! status: ${response.status}`;
    try {
      const json = await response.json();
      if (json?.message) errorMsg = json.message;
    } catch (e) { /* ignore */ }
    throw new Error(errorMsg);
  }

  // Trả về Blob file Excel
  return await response.blob();
};

// Lấy thống kê điểm rèn luyện theo lớp
export const getStatisticsByLop = (namHoc) => {
  return apiFetch(`/api/diem_ren_luyen/statistics/lop?nam_hoc=${namHoc}`);
};

// Lấy thống kê điểm rèn luyện theo khoa
export const getStatisticsByKhoa = (namHoc) => {
  return apiFetch(`/api/diem_ren_luyen/statistics/khoa?nam_hoc=${namHoc}`);
};

// Cập nhật điểm rèn luyện
export const updateDiemRenLuyen = (id, data) => {
  return apiFetch(`/api/diem_ren_luyen/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

// Xóa điểm rèn luyện
export const deleteDiemRenLuyen = (id) => {
  return apiFetch(`/api/diem_ren_luyen/${id}`, {
    method: 'DELETE'
  });
};
