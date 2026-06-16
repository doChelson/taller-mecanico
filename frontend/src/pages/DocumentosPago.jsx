import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { getDocumentos, createDocumento, deleteDocumento } from '../api/documentosPago';
import { getPresupuestos } from '../api/presupuestos';

const TIPOS = ['BOLETA', 'FACTURA'];
const EMPTY = { presupuestoId: '', tipoDocumento: 'BOLETA' };

export default function DocumentosPago() {
  const [documentos, setDocumentos] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([getDocumentos(), getPresupuestos()])
      .then(([d, p]) => { setDocumentos(d); setPresupuestos(p); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const presupuestoLabel = (id) => {
    const p = presupuestos.find(p => p.id === id || p.id === Number(id));
    return p ? `Presupuesto #${p.id} — $${Number(p.montoTotal ?? 0).toLocaleString('es-CL')}` : `Presupuesto #${id}`;
  };

  const openCreate = () => { setForm(EMPTY); setFormError(''); setModal('create'); };
  const openDelete = (d) => { setSelected(d); setFormError(''); setModal('delete'); };
  const close = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true); setFormError('');
    try {
      await createDocumento({ presupuestoId: Number(form.presupuestoId), tipoDocumento: form.tipoDocumento });
      load(); close();
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try { await deleteDocumento(selected.id); load(); close(); }
    catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const tipoBadge = (tipo) => {
    const colors = { BOLETA: 'bg-blue-100 text-blue-700', FACTURA: 'bg-purple-100 text-purple-700' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[tipo] || 'bg-slate-100 text-slate-700'}`}>{tipo}</span>;
  };

  const columns = [
    { key: 'id', header: 'N° Documento', render: d => `#${d.id}` },
    { key: 'presupuesto', header: 'Presupuesto', render: d => presupuestoLabel(d.presupuestoId ?? d.presupuesto?.id) },
    { key: 'tipo', header: 'Tipo', render: d => tipoBadge(d.tipoDocumento) },
    { key: 'fecha', header: 'Fecha', render: d => d.fechaEmision ? new Date(d.fechaEmision).toLocaleDateString('es-CL') : '—' },
    {
      key: 'acciones', header: 'Acciones',
      render: d => (
        <button onClick={() => openDelete(d)} className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      )
    }
  ];

  return (
    <Layout title="Documentos de Pago">
      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Emitir Documento
        </Button>
      </div>
      <Table columns={columns} data={documentos} loading={loading} emptyMessage="No hay documentos de pago emitidos." />

      <Modal isOpen={modal === 'create'} onClose={close} title="Emitir Documento de Pago"
        footer={<><Button variant="secondary" onClick={close}>Cancelar</Button><Button type="submit" form="doc-form" loading={formLoading}>Emitir</Button></>}>
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <form id="doc-form" onSubmit={handleSave} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Presupuesto <span className="text-red-500">*</span></label>
            <select value={form.presupuestoId} onChange={e => setForm(f => ({ ...f, presupuestoId: e.target.value }))} required
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar presupuesto…</option>
              {presupuestos.filter(p => p.estadoAprobacion === 'APROBADO').map(p => (
                <option key={p.id} value={p.id}>#{p.id} — ${Number(p.montoTotal ?? 0).toLocaleString('es-CL')} ({p.estadoAprobacion})</option>
              ))}
            </select>
            {presupuestos.filter(p => p.estadoAprobacion === 'APROBADO').length === 0 && (
              <p className="text-xs text-amber-600 mt-1">Solo se pueden emitir documentos para presupuestos aprobados.</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Tipo de documento</label>
            <select value={form.tipoDocumento} onChange={e => setForm(f => ({ ...f, tipoDocumento: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modal === 'delete'} onClose={close} title="Eliminar Documento" size="sm"
        footer={<><Button variant="secondary" onClick={close}>Cancelar</Button><Button variant="danger" onClick={handleDelete} loading={formLoading}>Eliminar</Button></>}>
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <p className="text-slate-600 text-sm">¿Eliminar el documento <strong>#{selected?.id}</strong>? Esta acción no se puede deshacer.</p>
      </Modal>
    </Layout>
  );
}
