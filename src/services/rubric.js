import { apiFetch } from './api';

export async function fetchRubric() {
  return apiFetch('/api/ds_rubric');
}

export async function fetchRubricById(id_rubric) {
  return apiFetch(`/api/ds_rubric/${id_rubric}`);
}

export async function createRubric(payload) {
  return apiFetch('/api/ds_rubric', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateRubric(id_rubric, payload) {
  return apiFetch(`/api/ds_rubric/${id_rubric}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteRubric(id_rubric) {
  return apiFetch(`/api/ds_rubric/${id_rubric}`, {
    method: 'DELETE'
  });
}

// --- Rubric details (chi_tiet_rubric) ---
export async function fetchRubricDetails(id_rubric) {
  return apiFetch(`/api/chi_tiet_rubric/${id_rubric}`);
}

export async function createRubricDetail(payload) {
  return apiFetch('/api/chi_tiet_rubric', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// update expects old criterion name as identifier
export async function updateRubricDetail(id_rubric, old_tieu_chi, payload) {
  return apiFetch(`/api/chi_tiet_rubric/${id_rubric}/${encodeURIComponent(old_tieu_chi)}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteRubricDetail(id_rubric, tieu_chi) {
  return apiFetch(`/api/chi_tiet_rubric/${id_rubric}/${encodeURIComponent(tieu_chi)}`, {
    method: 'DELETE'
  });
}
