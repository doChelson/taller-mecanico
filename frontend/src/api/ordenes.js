const BASE = '/api/ordenes';

async function handleResponse(res) {
  if (res.status === 204) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Error ${res.status}`);
  }
  return res.json();
}

export const getOrdenes = () => fetch(BASE).then(handleResponse);
export const getOrden = (id) => fetch(`${BASE}/${id}`).then(handleResponse);
export const getOrdenesByVehiculo = (vehiculoId) => fetch(`${BASE}/vehiculo/${vehiculoId}`).then(handleResponse);
export const getOrdenesByEstado = (estado) => fetch(`${BASE}/estado/${estado}`).then(handleResponse);
export const createOrden = (data) =>
  fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
export const deleteOrden = (id) =>
  fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(handleResponse);
