import { handleResponse } from './apiUtils';

const BASE = '/api/vehiculos';

export const getVehiculos = () => fetch(BASE).then(handleResponse);
export const createVehiculo = (data) =>
  fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
