const BASE = '/api/diagnosticos';

async function handleResponse(res) {
  if (res.status === 204) return null;
  if (!res.ok) { const t = await res.text(); throw new Error(t || `Error ${res.status}`); }
  return res.json();
}

export const getDiagnosticos = () => fetch(BASE).then(handleResponse);
export const getDiagnostico = (id) => fetch(`${BASE}/${id}`).then(handleResponse);
export const getDiagnosticoByOrden = (ordenId) => fetch(`${BASE}/orden/${ordenId}`).then(handleResponse);
export const createDiagnostico = (data) => fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
export const updateDiagnostico = (id, data) => fetch(`${BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
export const deleteDiagnostico = (id) => fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(handleResponse);
