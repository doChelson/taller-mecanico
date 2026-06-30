import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { getOrdenes, createOrden, deleteOrden, asignarMecanico } from '../api/ordenes';
import { getVehiculos } from '../api/vehiculos';
import { getMecanicos } from '../api/mecanicos';

const ESTADOS = ['CREADA', 'ASIGNADA', 'EN_PROCESO', 'FINALIZADA'];
const EMPTY_FORM = { vehiculoId: '', estado: 'CREADA', diagnosticoPreliminar: '' };

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [mecanicos, setMecanicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [mecanicoId, setMecanicoId] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([getOrdenes(), getVehiculos(), getMecanicos()])
      .then(([ords, vehs, mecs]) => {
        setOrdenes(ords);
        setVehiculos(vehs);
        setMecanicos(mecs);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = estadoFilter ? ordenes.filter((o) => o.estado === estadoFilter) : ordenes;

  const openCreate = () => { setForm(EMPTY_FORM); setFormError(''); setModal('create'); };
  const openDetail = (o) => { setSelected(o); setMecanicoId(''); setFormError(''); setModal('detail'); };
  const openDelete = (o) => { setSelected(o); setFormError(''); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); setFormError(''); };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      await createOrden({ ...form, vehiculoId: Number(form.vehiculoId) });
      load();
      closeModal();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleAsignar = async () => {
    if (!mecanicoId) return;
    setFormLoading(true);
    setFormError('');
    try {
      const updated = await asignarMecanico(selected.id, Number(mecanicoId));
      setSelected(updated);
      setMecanicoId('');
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await deleteOrden(selected.id);
      load();
      closeModal();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const mecanicosDisponibles = mecanicos.filter((m) => m.disponible);

  const columns = [
    { key: 'numero', header: 'Número' },
    { key: 'fechaIngreso', header: 'Fecha Ingreso', render: (o) => o.fechaIngreso ? new Date(o.fechaIngreso).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : '—' },
    { key: 'estado', header: 'Estado', render: (o) => <Badge status={o.estado} /> },
    { key: 'vehiculo', header: 'Vehículo', render: (o) => o.vehiculo ? `${o.vehiculo.patente} – ${o.vehiculo.marca} ${o.vehiculo.modelo}` : '—' },
    { key: 'mecanico', header: 'Mecánico', render: (o) => o.mecanico ? o.mecanico.nombre : <span className="text-slate-400 text-xs">Sin asignar</span> },
    {
      key: 'acciones', header: 'Acciones',
      render: (o) => (
        <div className="flex gap-1">
          <button onClick={() => openDetail(o)} title="Ver detalle"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </button>
          <button onClick={() => openDelete(o)} title="Eliminar"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout title="Órdenes de Trabajo">
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setEstadoFilter('')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${estadoFilter === '' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            Todas
          </button>
          {ESTADOS.map((e) => (
            <button
              key={e}
              onClick={() => setEstadoFilter(e)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${estadoFilter === e ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {e}
            </button>
          ))}
        </div>
        <Button onClick={openCreate}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nueva Orden
        </Button>
      </div>

      <Table columns={columns} data={filtered} loading={loading} emptyMessage="No hay órdenes registradas." />

      {/* Create modal */}
      <Modal
        isOpen={modal === 'create'}
        onClose={closeModal}
        title="Nueva Orden de Trabajo"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" form="orden-form" loading={formLoading}>Crear Orden</Button>
          </>
        }
      >
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <form id="orden-form" onSubmit={handleCreate} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Vehículo <span className="text-red-500">*</span></label>
            <select
              required
              value={form.vehiculoId}
              onChange={(e) => setForm((f) => ({ ...f, vehiculoId: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar vehículo…</option>
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.patente} – {v.marca} {v.modelo} ({v.anio})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Estado</label>
            <select
              value={form.estado}
              onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Diagnóstico Preliminar</label>
            <textarea
              rows={3}
              value={form.diagnosticoPreliminar}
              onChange={(e) => setForm((f) => ({ ...f, diagnosticoPreliminar: e.target.value }))}
              placeholder="Descripción del problema o diagnóstico inicial…"
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </form>
      </Modal>

      {/* Detail modal */}
      <Modal
        isOpen={modal === 'detail'}
        onClose={closeModal}
        title={`Orden ${selected?.numero ?? ''}`}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cerrar</Button>
            <Button variant="danger" onClick={() => { closeModal(); setTimeout(() => openDelete(selected), 50); }}>Eliminar</Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-slate-400 text-xs mb-0.5">Número</p><p className="font-semibold text-slate-800">{selected.numero}</p></div>
              <div><p className="text-slate-400 text-xs mb-0.5">Estado</p><Badge status={selected.estado} /></div>
              <div><p className="text-slate-400 text-xs mb-0.5">Fecha Ingreso</p><p className="text-slate-700">{selected.fechaIngreso ? new Date(selected.fechaIngreso).toLocaleString('es-CL') : '—'}</p></div>
              <div><p className="text-slate-400 text-xs mb-0.5">Vehículo</p><p className="text-slate-700">{selected.vehiculo ? `${selected.vehiculo.patente} – ${selected.vehiculo.marca} ${selected.vehiculo.modelo}` : '—'}</p></div>
            </div>

            {selected.diagnosticoPreliminar && (
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Diagnóstico Preliminar</p>
                <p className="text-slate-700 bg-slate-50 rounded-lg p-3">{selected.diagnosticoPreliminar}</p>
              </div>
            )}

            {/* Sección mecánico */}
            <div className="border-t border-slate-100 pt-3">
              <p className="text-slate-400 text-xs mb-1">Mecánico Asignado</p>
              {selected.mecanico ? (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-sm">
                    {selected.mecanico.nombre?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{selected.mecanico.nombre}</p>
                    <p className="text-xs text-slate-500">{selected.mecanico.especialidad}</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 italic mb-3">Sin mecánico asignado</p>
              )}

              {formError && <p className="mb-2 text-sm text-red-600">{formError}</p>}

              <div className="flex gap-2">
                <select
                  value={mecanicoId}
                  onChange={(e) => setMecanicoId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{mecanicosDisponibles.length === 0 ? 'No hay mecánicos disponibles' : 'Seleccionar mecánico…'}</option>
                  {mecanicosDisponibles.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre} — {m.especialidad}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleAsignar}
                  loading={formLoading}
                  disabled={!mecanicoId}
                >
                  {selected.mecanico ? 'Cambiar' : 'Asignar'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete modal */}
      <Modal
        isOpen={modal === 'delete'}
        onClose={closeModal}
        title="Eliminar Orden"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete} loading={formLoading}>Eliminar</Button>
          </>
        }
      >
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <p className="text-slate-600 text-sm">
          ¿Estás seguro de que deseas eliminar la orden <strong>{selected?.numero}</strong>? Esta acción no se puede deshacer.
        </p>
      </Modal>
    </Layout>
  );
}
