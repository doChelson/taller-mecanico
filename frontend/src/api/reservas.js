const BASE = '/api/reservas';

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Error ${res.status}`);
  }
  return res.json();
}

export const getReservas = () => fetch(BASE).then(handleResponse);
export const createReserva = (data) =>
  fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handleResponse);
