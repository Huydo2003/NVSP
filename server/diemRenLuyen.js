/**
 * diemRenLuyen.js - Xử lý logic tính điểm rèn luyện
 * 
 * Quy tắc:
 * - Giải Nhất: +3 điểm
 * - Giải Nhì: +2 điểm
 * - Giải Ba: +1 điểm
 * - Giải Khuyến khích: +0.5 điểm
 * - Tham dự hoạt động: +0.25 điểm
 */

// Bảng xếp loại dựa trên điểm
const XEPLOAI_THRESHOLDS = {
  '90-100': 'Xuất sắc',
  '80-89': 'Tốt',
  '70-79': 'Khá',
  '60-69': 'Trung bình',
  '50-59': 'Yếu',
  '0-49': 'Kém'
};

// Lấy xếp loại từ điểm
function getXepLoaiFromDiem(diem) {
  if (diem >= 90) return XEPLOAI_THRESHOLDS['90-100'];
  if (diem >= 80) return XEPLOAI_THRESHOLDS['80-89'];
  if (diem >= 70) return XEPLOAI_THRESHOLDS['70-79'];
  if (diem >= 60) return XEPLOAI_THRESHOLDS['60-69'];
  if (diem >= 50) return XEPLOAI_THRESHOLDS['50-59'];
  return XEPLOAI_THRESHOLDS['0-49'];
}

// Tính điểm dựa trên giải thưởng
function calculateDiemFromGiai(giaiThuong) {
  if (!giaiThuong) return 0.25; // Mặc định tham dự
  
  const giai = String(giaiThuong).toLowerCase().trim();
  
  if (giai.includes('nhất') || giai.includes('1st') || giai.includes('first')) return 3;
  if (giai.includes('nhì') || giai.includes('2nd') || giai.includes('second')) return 2;
  if (giai.includes('ba') || giai.includes('3rd') || giai.includes('third')) return 1;
  if (giai.includes('khuyến khích') || giai.includes('encouragement')) return 0.5;
  
  return 0.25; // Mặc định tham dự
}

// Lấy giá trị điểm từ tên giải
const GIAI_DIEM_MAP = {
  'Giải Nhất': 3,
  'Giải Nhì': 2,
  'Giải Ba': 1,
  'Giải Khuyến khích': 0.5,
  'Tham dự': 0.25
};

module.exports = {
  XEPLOAI_THRESHOLDS,
  GIAI_DIEM_MAP,
  getXepLoaiFromDiem,
  calculateDiemFromGiai
};
