// Default configuration
export const defaultConfig = {
  system_title: "Hệ Thống Quản Lý Người Dùng NVSP",
  organization_name: "Trường Đại học ABC",
  contact_email: "admin@university.edu.vn",
  primary_color: "#667eea",
  secondary_color: "#764ba2",
  background_color: "#f8fafc",
  text_color: "#1e293b",
  accent_color: "#10b981"
};

// Mock user data
export const mockUsers = {
  admin: { id: 1, username: 'admin', role: 'admin', name: 'Quản trị viên', email: 'admin@university.edu.vn' },
  btc: { id: 2, username: 'btc', role: 'btc', name: 'Ban tổ chức', email: 'btc@university.edu.vn' },
  cbl: { id: 3, username: 'cbl', role: 'cbl', name: 'Cán bộ lớp', email: 'cbl@university.edu.vn' },
  student: { id: 4, username: 'student', role: 'student', name: 'Sinh viên', email: 'student@university.edu.vn' },
  judge: { id: 5, username: 'judge', role: 'judge', name: 'Ban giám khảo', email: 'judge@university.edu.vn' }
};

// Utility functions
export const generateId = () => Math.random().toString(36).substr(2, 9);
export const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN');
export const formatDateTime = (date) => new Date(date).toLocaleString('vi-VN');

export let globalConfig = { ...defaultConfig };
export let allData = [];