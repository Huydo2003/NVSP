// Default configuration
export const defaultConfig = {
  system_title: "Hệ Thống Quản Lý NVSP",
  organization_name: "Trường Đại học ABC",
  contact_email: "admin@@hnue.edu.vn",
  primary_color: "#667eea",
  secondary_color: "#764ba2",
  background_color: "#f8fafc",
  text_color: "#1e293b",
  accent_color: "#10b981"
};

// Utility functions
export const generateId = () => Math.random().toString(36).substr(2, 9);
export const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN');
export const formatDateTime = (date) => new Date(date).toLocaleString('vi-VN');

export let globalConfig = { ...defaultConfig };
export let allData = [];