import { apiFetch } from './api';

// GET tất cả log tra cứu GCN
export const fetchLogTraCuuAll = () => {
  return apiFetch('/api/log_tra_cuu');
};

// GET log tra cứu theo id_gcn
export const fetchLogTraCuuByGcnId = (idGcn) => {
  return apiFetch(`/api/log_tra_cuu/${idGcn}`);
};

// Thêm log tra cứu
export const addLogTraCuu = (data) => {
  return apiFetch('/api/log_tra_cuu', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// GET tất cả thông tin GCN
export const fetchGCNAll = () => {
  return apiFetch('/api/thong_tin_gcn');
};

// GET thông tin GCN theo id
export const fetchGCNById = (id) => {
  return apiFetch(`/api/thong_tin_gcn/${id}`);
};

// Tìm kiếm GCN (theo loại, nội dung, ...)
export const searchGCN = (searchParams) => {
  const queryString = new URLSearchParams(searchParams).toString();
  return apiFetch(`/api/thong_tin_gcn/search?${queryString}`);
};
