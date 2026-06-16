import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { getAvances, createAvance, updateAvance, deleteAvance } from '../api/avances';
import { getOrdenes } from '../api/ordenes';

const ESTADOS = ['EN_PROCESO', 'PAUSADO', 'COMPLETADO'];
const EMPTY = { descripcion: '', porcentajeAvance: '', estado: 'EN_PROCESO', ordenTrabajoId: '' };

export default function Avances() {
  const [avances, setAvances] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
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
    Promise.all([getAvances(), getOrdenes()])
      .then(([a, o]) => { setAvances(a); setOrdenes(o); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const ordenLabel = (id) => {
    const o = ordenes.find(o => o.id === id || o.id === Number(id));
    return o ? `#${o.id} — ${o.vehiculo?.patente ?? ''}` : `Orden #${id}`;
  };

  const filtered = filtroEstado === 'TODOS' ? avances : avances.filter(a => a.estado === filtroEstado);

  const openCreate = () => { setForm(EMPTY); setFormError(''); setModal('create'); };
  const openEdit = (a) => { setSelected(a); setForm({ descripcion: a.descripcion ?? '', porcentajeAvance: a.porcentajeAvance ?? '', estado: a.estado ?? 'EN_PROCESO', ordenTrabajoId: a.ordenTrabajoId ?? a.ordenTrabajo?.id ?? '' }); setFormError(''); setModal('edit'); };
  const openDelete = (a) => { setSelected(a); setFormError(''); setModal('delete'); };
  const close = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true); setFormError('');
    try {
      const payload = { ...form, ordenTrabajoId: Number(form.ordenTrabajoId), porcentajeAvance: Number(form.porcentajeAvance) };
      if (modal === 'create') await createAvance(payload);
      else await updateAvance(selected.id, payload);
      load(); close();
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try { await deleteAvance(selected.id); load(); close(); }
    catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const estadoColor = { EN_PROCESO: 'EN_PROCESO', PAUSADO: 'PENDIENTE', COMPLETADO: 'FINALIZADA' };

  const columns = [
    { key: 'id', header: 'ID', render: a => `#${a.id}` },
    { key: 'orden', header: 'Orden', render: a => ordenLabel(a.ordenTrabajoId ?? a.ordenTrabajo?.id) },
    { key: 'descripcion', header: 'Descripción', render: a => <span className="line-clamp-1">{a.descripcion || '—'}</span> },
    {
      key: 'porcentaje', header: 'Avance',
      render: a => (
        <div className="flex items-center gap-2 min-w-[120px]">
          <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, a.porcentajeAvance || 0)}%` }} />
          </div>
          <span className="text-xs font-medium text-slate-600 w-10 text-right">{a.porcentajeAvance ?? 0}%</span>
        </div>
      )
    },
    { key: 'estado', header: 'Estado', render: a => <Badge status={estadoColor[a.estado] || 'PENDIENTE'} /> },
    {
      key: 'acciones', header: 'Acciones',
      render: a => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg text-slate-500 hover:bg-yellow-50 hover:text-yellow-600 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button onClick={() => openDelete(a)} className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      )
    }
  ];

  return (
    <Layout title="Avances de Reparación">
      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {['TODOS', ...ESTADOS].map(e => (
            <button key={e} onClick={() => setFiltroEstado(e)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filtroEstado === e ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
              {e === 'TODOS' ? 'Todos' : e.replace('_', ' ')}
            </button>
          ))}
        </div>
        <Button onClick={openCreate}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo Avance
        </Button>
      </div>
      <Table columns={columns} data={filtered} loading={loading} emptyMessage="No hay avances registrados." />

      <Modal isOpen={modal === 'create' || modal === 'edit'} onClose={close} title={modal === 'create' ? 'Nuevo Avance' : 'Editar Avance'}
        footer={<><Button variant="secondary" onClick={close}>Cancelar</Button><Button type="submit" form="av-form" loading={formLoading}>Guardar</Button></>}>
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <form id="av-form" onSubmit={handleSave} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Orden de Trabajo <span className="text-red-500">*</span></label>
            <select value={form.ordenTrabajoId} onChange={e => setForm(f => ({ ...f, ordenTrabajoId: e.target.value }))} required
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar orden…</option>
              {ordenes.map(o => <option key={o.id} value={o.id}>#{o.id} — {o.vehiculo?.patente ?? ''} ({o.estado})</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="descripcion" className="text-sm font-medium text-slate-700">Descripción <span className="text-red-500">*</span></label>
            <textarea id="descripcion" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} required rows={3}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <Input label="Porcentaje de avance (0-100)" id="porcentaje" type="number" min="0" max="100" value={form.porcentajeAvance} onChange={e => setForm(f => ({ ...f, porcentajeAvance: e.target.value }))} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Estado</label>
            <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {ESTADOS.map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
            </select>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modal === 'delete'} onClose={close} title="Eliminar Avance" size="sm"
        footer={<><Button variant="secondary" onClick={close}>Cancelar</Button><Button variant="danger" onClick={handleDelete} loading={formLoading}>Eliminar</Button></>}>
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <p className="text-slate-600 text-sm">¿Eliminar el avance <strong>#{selected?.id}</strong>? Esta acción no se puede deshacer.</p>
      </Modal>
    </Layout>
  );
}
