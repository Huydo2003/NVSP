import { apiFetch } from './api';

export async function fetchCertificates() {
  return apiFetch('/api/certificates');
}

export async function createCertificate(data) {
  return apiFetch('/api/certificates', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateCertificate(id, data) {
  return apiFetch(`/api/certificates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteCertificate(id) {
  return apiFetch(`/api/certificates/${id}`, {
    method: 'DELETE'
  });
}
