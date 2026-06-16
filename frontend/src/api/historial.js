export const getHistorialByVehiculo = (vehiculoId) =>
  fetch(`/api/historial/vehiculo/${vehiculoId}`).then(async (res) => {
    if (!res.ok) { const t = await res.text(); throw new Error(t || `Error ${res.status}`); }
    return res.json();
  });
