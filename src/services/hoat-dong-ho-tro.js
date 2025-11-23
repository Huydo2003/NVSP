import { apiFetch } from './api';

export async function fetchHoatDongHoTro() {   
    return apiFetch('/api/hoat-dong-ho-tro');
}

export async function fetchHoatDongHoTroById(id) {
    return apiFetch(`/api/hoat-dong-ho-tro/${id}`);
}

export async function createHoatDongHoTro(payload) {
    return apiFetch('/api/hoat-dong-ho-tro', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

export async function updateHoatDongHoTro(id, payload) {
    return apiFetch(`/api/hoat-dong-ho-tro/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });
}

export async function deleteHoatDongHoTro(id) {
    return apiFetch(`/api/hoat-dong-ho-tro/${id}`, {
        method: 'DELETE'
    });
}