import { handleResponse } from './apiUtils';

const BASE = '/api/vehiculos';

export const getVehiculos = () => fetch(BASE).then(handleResponse);
export const createVehiculo = (data) =>
  fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
export const updateVehiculo = (id, data) =>
  fetch(`${BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
export const deleteVehiculo = (id) =>
  fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(handleResponse);
