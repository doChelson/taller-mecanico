import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { getSolicitudes, createSolicitud, confirmarRecepcion, deleteSolicitud } from '../api/solicitudesRepuesto';
import { getOrdenes } from '../api/ordenes';
import { getRepuestos } from '../api/repuestos';

const ESTADOS_CREACION = ['PENDIENTE', 'APROBADA', 'RECHAZADA'];
const ESTADOS_FILTRO = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'RECIBIDA'];
const EMPTY = { ordenTrabajoId: '', repuestoId: '', cantidad: '', estado: 'PENDIENTE' };

export default function SolicitudesRepuesto() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [repuestos, setRepuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([getSolicitudes(), getOrdenes(), getRepuestos()])
      .then(([s, o, r]) => { setSolicitudes(s); setOrdenes(o); setRepuestos(r); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const ordenLabel = (id) => {
    const o = ordenes.find(o => o.id === id || o.id === Number(id));
    return o ? `#${o.id} — ${o.vehiculo?.patente ?? ''}` : `Orden #${id}`;
  };
  const repuestoLabel = (id) => {
    const r = repuestos.find(r => r.id === id || r.id === Number(id));
    return r ? `${r.nombre} (${r.codigo})` : `Repuesto #${id}`;
  };

  const filtered = filtroEstado === 'TODOS' ? solicitudes : solicitudes.filter(s => s.estado === filtroEstado);

  const openCreate = () => { setForm(EMPTY); setFormError(''); setModal('create'); };
  const openDelete = (s) => { setSelected(s); setFormError(''); setModal('delete'); };
  const openConfirmar = (s) => { setSelected(s); setFormError(''); setModal('confirmar'); };
  const close = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true); setFormError('');
    try {
      await createSolicitud({
        ordenTrabajoId: Number(form.ordenTrabajoId),
        repuestoId: Number(form.repuestoId),
        cantidad: Number(form.cantidad),
        estado: form.estado,
      });
      load(); close();
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try { await deleteSolicitud(selected.id); load(); close(); }
    catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const handleConfirmar = async () => {
    setFormLoading(true);
    try { await confirmarRecepcion(selected.id); load(); close(); }
    catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const estadoColor = { PENDIENTE: 'PENDIENTE', APROBADA: 'FINALIZADA', RECHAZADA: 'CANCELADA', RECIBIDA: 'CONFIRMADA' };

  const columns = [
    { key: 'id', header: 'ID', render: s => `#${s.id}` },
    { key: 'orden', header: 'Orden', render: s => ordenLabel(s.ordenTrabajoId ?? s.ordenTrabajo?.id) },
    { key: 'repuesto', header: 'Repuesto', render: s => repuestoLabel(s.repuestoId ?? s.repuesto?.id) },
    { key: 'cantidad', header: 'Cantidad', render: s => s.cantidad },
    { key: 'estado', header: 'Estado', render: s => <Badge status={estadoColor[s.estado] || 'PENDIENTE'} /> },
    {
      key: 'acciones', header: 'Acciones',
      render: s => (
        <div className="flex gap-1">
          {s.estado === 'APROBADA' && (
            <button onClick={() => openConfirmar(s)} title="Confirmar recepción"
              className="p-1.5 rounded-lg text-slate-500 hover:bg-green-50 hover:text-green-600 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
          )}
          <button onClick={() => openDelete(s)} title="Eliminar"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      )
    }
  ];

  return (
    <Layout title="Solicitudes de Repuesto">
      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {['TODOS', ...ESTADOS_FILTRO].map(e => (
            <button key={e} onClick={() => setFiltroEstado(e)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filtroEstado === e ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
              {e === 'TODOS' ? 'Todos' : e}
            </button>
          ))}
        </div>
        <Button onClick={openCreate}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nueva Solicitud
        </Button>
      </div>
      <Table columns={columns} data={filtered} loading={loading} emptyMessage="No hay solicitudes de repuesto registradas." />

      <Modal isOpen={modal === 'create'} onClose={close} title="Nueva Solicitud de Repuesto"
        footer={<><Button variant="secondary" onClick={close}>Cancelar</Button><Button type="submit" form="sol-form" loading={formLoading}>Guardar</Button></>}>
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <form id="sol-form" onSubmit={handleSave} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Orden de Trabajo <span className="text-red-500">*</span></label>
            <select value={form.ordenTrabajoId} onChange={e => setForm(f => ({ ...f, ordenTrabajoId: e.target.value }))} required
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar orden…</option>
              {ordenes.map(o => <option key={o.id} value={o.id}>#{o.id} — {o.vehiculo?.patente ?? ''} ({o.estado})</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Repuesto <span className="text-red-500">*</span></label>
            <select value={form.repuestoId} onChange={e => setForm(f => ({ ...f, repuestoId: e.target.value }))} required
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar repuesto…</option>
              {repuestos.map(r => <option key={r.id} value={r.id}>{r.nombre} — Stock: {r.stock}</option>)}
            </select>
          </div>
          <Input label="Cantidad" id="cantidad" type="number" min="1" value={form.cantidad} onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Estado inicial</label>
            <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {ESTADOS_CREACION.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modal === 'delete'} onClose={close} title="Eliminar Solicitud" size="sm"
        footer={<><Button variant="secondary" onClick={close}>Cancelar</Button><Button variant="danger" onClick={handleDelete} loading={formLoading}>Eliminar</Button></>}>
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <p className="text-slate-600 text-sm">¿Eliminar la solicitud <strong>#{selected?.id}</strong>? Esta acción no se puede deshacer.</p>
      </Modal>

      <Modal isOpen={modal === 'confirmar'} onClose={close} title="Confirmar recepción" size="sm"
        footer={<><Button variant="secondary" onClick={close}>Cancelar</Button><Button onClick={handleConfirmar} loading={formLoading}>Confirmar recepción</Button></>}>
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <p className="text-slate-600 text-sm">
          ¿Confirmas la recepción de la solicitud <strong>#{selected?.id}</strong>? Esto sumará el repuesto al stock y marcará la solicitud como <strong>RECIBIDA</strong>.
        </p>
      </Modal>
    </Layout>
  );
}
