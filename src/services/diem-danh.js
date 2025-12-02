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

export async function fetchDiemDanhByActivity(id_hd_tham_du) {
  return apiFetch(`/api/diem-danh/activity/${id_hd_tham_du}`);
}

export async function fetchDiemDanhStats() {
  return apiFetch('/api/diem-danh/stats');
}

// Export approved attendance CSV (returns { blob, filename })
export async function exportApprovedDiemDanh(options = {}) {
  const { filename = 'diem_danh_duyet_v2.csv', fields = [], id_hd } = options || {};

  // determine API base
  const envBase = window.__NVSP_API_BASE__ || (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || '';
  const fallbackBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:4000' : '';
  const apiBase = envBase || fallbackBase;

  const token = localStorage.getItem('nvsp_token');
  if (!token) {
    throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
  }

  const params = new URLSearchParams();
  if (filename) params.set('filename', filename);
  if (Array.isArray(fields) && fields.length > 0) params.set('fields', fields.join(','));
  if (typeof id_hd !== 'undefined' && id_hd !== null) params.set('id_hd', id_hd);
  const url = `${apiBase}/api/diem-danh/export${params.toString() ? `?${params.toString()}` : ''}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'text/csv,*/*'
    }
  });

  if (!res.ok) {
    let err = `Export failed (status ${res.status})`;
    try {
      const j = await res.json();
      if (j?.message) err = j.message;
    } catch (e) { /* ignore */ }
    throw new Error(err);
  }

  const contentType = (res.headers.get('Content-Type') || '').toLowerCase();
  if (!contentType.includes('text/csv') && !contentType.includes('application/octet-stream') && !contentType.includes('text/plain')) {
    const text = await res.text();
    const short = text.length > 1000 ? text.slice(0, 1000) + '... (truncated)' : text;
    throw new Error(`Unexpected response content-type: ${contentType}. Response starts with:\n${short}`);
  }

  // parse filename from Content-Disposition if present
  let outFilename = filename;
  const cd = res.headers.get('Content-Disposition') || res.headers.get('content-disposition');
  if (cd) {
    const fnMatch = cd.match(/filename\*=(?:UTF-8'')?([^;]+)/i);
    if (fnMatch && fnMatch[1]) {
      try {
        outFilename = decodeURIComponent(fnMatch[1].trim().replace(/^"|"$/g, ''));
      } catch (e) {
        outFilename = fnMatch[1].trim().replace(/^"|"$/g, '');
      }
    } else {
      const fnMatch2 = cd.match(/filename="?([^";]+)"?/i);
      if (fnMatch2 && fnMatch2[1]) outFilename = fnMatch2[1].trim();
    }
  }

  const blob = await res.blob();
  return { blob, filename: outFilename };
}