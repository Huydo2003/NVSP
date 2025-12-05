import { apiFetch } from './api';

// GET toàn bộ log giấy chứng nhận
export const fetchLogGCNAll = () => {
  return apiFetch('/api/log_gcn');
};

// Thêm log giấy chứng nhận
export const addLogGCN = (data) => {
  return apiFetch('/api/log_gcn', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};