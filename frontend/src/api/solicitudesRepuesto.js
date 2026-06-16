import { handleResponse } from './apiUtils';

const BASE = '/api/solicitudes-repuestos';

export const getSolicitudes = () => fetch(BASE).then(handleResponse);
export const getSolicitud = (id) => fetch(`${BASE}/${id}`).then(handleResponse);
export const getSolicitudesByOrden = (ordenId) => fetch(`${BASE}/orden/${ordenId}`).then(handleResponse);
export const getSolicitudesByEstado = (estado) => fetch(`${BASE}/estado/${estado}`).then(handleResponse);
export const createSolicitud = (data) => fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
export const deleteSolicitud = (id) => fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(handleResponse);
