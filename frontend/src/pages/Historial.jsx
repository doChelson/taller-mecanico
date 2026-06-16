import { useState } from 'react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { getHistorialByVehiculo } from '../api/historial';
import { getVehiculos } from '../api/vehiculos';
import { useEffect } from 'react';

export default function Historial() {
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculoId, setVehiculoId] = useState('');
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingVehiculos, setLoadingVehiculos] = useState(true);
  const [error, setError] = useState('');
  const [buscado, setBuscado] = useState(false);

  useEffect(() => {
    getVehiculos().then(setVehiculos).catch(e => setError(e.message)).finally(() => setLoadingVehiculos(false));
  }, []);

  const buscar = async (e) => {
    e.preventDefault();
    if (!vehiculoId) return;
    setLoading(true); setError(''); setBuscado(false);
    try {
      const data = await getHistorialByVehiculo(vehiculoId);
      setHistorial(data);
      setBuscado(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const vehiculoSeleccionado = vehiculos.find(v => v.id === Number(vehiculoId));

  return (
    <Layout title="Historial de Mantención">
      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-700 mb-4">Consultar historial por vehículo</h2>
        <form onSubmit={buscar} className="flex gap-3 items-end flex-wrap">
          <div className="flex flex-col gap-1 flex-1 min-w-[240px]">
            <label className="text-sm font-medium text-slate-700">Vehículo</label>
            {loadingVehiculos ? (
              <div className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-400">Cargando vehículos…</div>
            ) : (
              <select value={vehiculoId} onChange={e => { setVehiculoId(e.target.value); setBuscado(false); setHistorial([]); }} required
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar vehículo…</option>
                {vehiculos.map(v => <option key={v.id} value={v.id}>{v.patente} — {v.marca} {v.modelo} ({v.año})</option>)}
              </select>
            )}
          </div>
          <Button type="submit" loading={loading} disabled={!vehiculoId}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Consultar
          </Button>
        </form>
      </div>

      {buscado && (
        <div>
          {vehiculoSeleccionado && (
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <div>
                <p className="font-semibold text-slate-800">{vehiculoSeleccionado.patente} — {vehiculoSeleccionado.marca} {vehiculoSeleccionado.modelo}</p>
                <p className="text-sm text-slate-500">Año {vehiculoSeleccionado.año} · {historial.length} registro{historial.length !== 1 ? 's' : ''} encontrado{historial.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )}

          {historial.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <svg className="h-12 w-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <p className="text-slate-500">No hay historial de mantención para este vehículo.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historial.map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">Orden #{item.ordenId ?? item.id}</span>
                      {item.estado && <Badge status={item.estado} />}
                    </div>
                    <span className="text-sm text-slate-400">
                      {item.fecha ? new Date(item.fecha).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {item.descripcion && (
                      <div className="sm:col-span-2">
                        <span className="font-medium text-slate-500">Descripción: </span>
                        <span className="text-slate-700">{item.descripcion}</span>
                      </div>
                    )}
                    {item.diagnostico && (
                      <div>
                        <span className="font-medium text-slate-500">Diagnóstico: </span>
                        <span className="text-slate-700">{item.diagnostico}</span>
                      </div>
                    )}
                    {item.fallas && (
                      <div>
                        <span className="font-medium text-slate-500">Fallas: </span>
                        <span className="text-slate-700">{item.fallas}</span>
                      </div>
                    )}
                    {item.mecanico && (
                      <div>
                        <span className="font-medium text-slate-500">Mecánico: </span>
                        <span className="text-slate-700">{item.mecanico}</span>
                      </div>
                    )}
                    {item.montoTotal != null && (
                      <div>
                        <span className="font-medium text-slate-500">Total: </span>
                        <span className="text-slate-700 font-semibold">${Number(item.montoTotal).toLocaleString('es-CL')}</span>
                      </div>
                    )}
                    {item.kilometraje != null && (
                      <div>
                        <span className="font-medium text-slate-500">Kilometraje: </span>
                        <span className="text-slate-700">{Number(item.kilometraje).toLocaleString('es-CL')} km</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
