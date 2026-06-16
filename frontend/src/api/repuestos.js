const BASE = '/api/repuestos';

async function handleResponse(res) {
  if (res.status === 204) return null;
  if (!res.ok) { const t = await res.text(); throw new Error(t || `Error ${res.status}`); }
  return res.json();
}

export const getRepuestos = () => fetch(BASE).then(handleResponse);
export const getRepuesto = (id) => fetch(`${BASE}/${id}`).then(handleResponse);
export const getRepuestosStockBajo = (limite) => fetch(`${BASE}/stock-bajo/${limite}`).then(handleResponse);
export const createRepuesto = (data) => fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
export const updateRepuesto = (id, data) => fetch(`${BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
export const aumentarStock = (id, cantidad) => fetch(`${BASE}/${id}/aumentar-stock`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cantidad }) }).then(handleResponse);
export const disminuirStock = (id, cantidad) => fetch(`${BASE}/${id}/disminuir-stock`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cantidad }) }).then(handleResponse);
export const deleteRepuesto = (id) => fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(handleResponse);
