import { apiFetch } from './api';

export async function fetchRubric() {
  return apiFetch('/api/ds_rubrics');
}

export async function fetchRubricById(id_rubric) {
  return apiFetch(`/api/ds_rubrics/${id_rubric}`);
}

export async function createRubric(payload) {
  return apiFetch('/api/ds_rubrics', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateRubric(id_rubric, payload) {
  return apiFetch(`/api/ds_rubrics/${id_rubric}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteRubric(id_rubric) {
  return apiFetch(`/api/ds_rubrics/${id_rubric}`, {
    method: 'DELETE'
  });
}
