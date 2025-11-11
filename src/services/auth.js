import { apiFetch } from './api';

function mapRoleFromNameOrId(roleName, roleId) {
  if (roleName) {
    const rn = roleName.toLowerCase();
    if (rn.includes('admin')) return 'admin';
    if (rn.includes('bantochuc') || rn.includes('ban to chuc') || rn.includes('bantochuc')) return 'btc';
    if (rn.includes('canbolop') || rn.includes('can bo lop')) return 'cbl';
    if (rn.includes('sinhvien') || rn.includes('sinh viên')) return 'student';
    if (rn.includes('giamkhao') || rn.includes('giám khảo') || rn.includes('giam khảo')) return 'judge';
  }
  // fallback by known ids from SQL dump
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
  user.role = mapRoleFromNameOrId(user.roleName, user.roleId) || user.role || null;
  return user;
}

export async function login(username, password) {
  const body = { username, password };
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
