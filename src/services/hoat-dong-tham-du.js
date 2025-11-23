import { apiFetch } from './api';

export async function fetchHoatDongThamDu() {   
    return apiFetch('/api/hoat-dong-tham-du');
}

export async function fetchHoatDongThamDuById(id) {
    return apiFetch(`/api/hoat-dong-tham-du/${id}`);
}

export async function createHoatDongThamDu(payload) {
    return apiFetch('/api/hoat-dong-tham-du', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

export async function updateHoatDongThamDu(id, payload) {
    return apiFetch(`/api/hoat-dong-tham-du/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });
}

export async function deleteHoatDongThamDu(id) {
    return apiFetch(`/api/hoat-dong-tham-du/${id}`, {
        method: 'DELETE'
    });
}

