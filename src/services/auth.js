import { apiFetch } from './api';

function mapRoleFromString(roleStr) {
  if (!roleStr) return null;
  const r = String(roleStr).toLowerCase();
  if (r.includes('admin')) return 'admin';
  if (r.includes('bantochuc') || r.includes('ban to chuc') || r.includes('ban tổ chức') || r.includes('btc')) return 'btc';
  if (r.includes('canbo') || r.includes('can bo') || r.includes('cbl')) return 'cbl';
  if (r.includes('sinh') || r.includes('sinh viên') || r.includes('sinh_vien')) return 'student';
  if (r.includes('giamkhao') || r.includes('giám khảo') || r.includes('giam khao')) return 'judge';
  if (r.includes('giang') || r.includes('giảng')) return 'giangvien';
  return null;
}

function mapRoleFromNameOrId(roleName, roleId) {
  // prefer string role (server now returns `role` or `loai_tk`)
  if (roleName) {
    const mapped = mapRoleFromString(roleName);
    if (mapped) return mapped;
  }
  if (roleId) {
    const id = Number(roleId);
    if (id === 1) return 'admin';
    if (id === 2) return 'btc';
    if (id === 3) return 'cbl';
    if (id === 4) return 'student';
    if (id === 5) return 'judge';
  }
  return null;
}

function normalizeUser(u) {
  if (!u) return u;
  const user = Object.assign({}, u);
  // server may return different fields: role / loai_tk / roleName / roleId
  const roleStr = user.role || user.loai_tk || user.roleName || null;
  const roleId = user.roleId || user.loai_tk_id || null;
  user.role = mapRoleFromNameOrId(roleStr, roleId) || user.role || null;
  // unify common fields
  if (user.ma_ca_nhan) user.username = user.ma_ca_nhan;
  if (user.ho_ten) user.fullName = user.ho_ten;
  // keep mustChangePassword if provided
  if (user.mustChangePassword === undefined) user.mustChangePassword = false;
  return user;
}

export async function login(ma_ca_nhan, mat_khau) {
  const body = { ma_ca_nhan, mat_khau };
  const data = await apiFetch('/api/login', { method: 'POST', body: JSON.stringify(body) });
  if (data && data.token && data.user) {
    const nu = normalizeUser(data.user);
    localStorage.setItem('nvsp_token', data.token);
    localStorage.setItem('nvsp_user', JSON.stringify(nu));
    data.user = nu;
  }
  return data;
}

export function logout() {
  localStorage.removeItem('nvsp_token');
  localStorage.removeItem('nvsp_user');
}

export function getStoredUser() {
  try {
    const s = localStorage.getItem('nvsp_user');
    return s ? normalizeUser(JSON.parse(s)) : null;
  } catch {
    return null;
  }
}

export async function fetchMe() {
  const data = await apiFetch('/api/me');
  return normalizeUser(data);
}
