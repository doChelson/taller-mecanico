import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { getRepuestos, createRepuesto, updateRepuesto, aumentarStock, disminuirStock, deleteRepuesto } from '../api/repuestos';

const EMPTY = { codigo: '', nombre: '', stock: '', precioUnitario: '' };

export default function Repuestos() {
  const [repuestos, setRepuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [cantidad, setCantidad] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () => {
    setLoading(true);
    getRepuestos().then(setRepuestos).catch(e => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = repuestos.filter(r => {
    const q = search.toLowerCase();
    return r.nombre?.toLowerCase().includes(q) || r.codigo?.toLowerCase().includes(q);
  });

  const openCreate = () => { setForm(EMPTY); setFormError(''); setModal('create'); };
  const openEdit = (r) => { setSelected(r); setForm({ codigo: r.codigo, nombre: r.nombre, stock: r.stock, precioUnitario: r.precioUnitario }); setFormError(''); setModal('edit'); };
  const openStock = (r, tipo) => { setSelected(r); setCantidad(''); setFormError(''); setModal(tipo); };
  const openDelete = (r) => { setSelected(r); setFormError(''); setModal('delete'); };
  const close = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true); setFormError('');
    try {
      const payload = { ...form, stock: Number(form.stock), precioUnitario: Number(form.precioUnitario) };
      if (modal === 'create') await createRepuesto(payload);
      else await updateRepuesto(selected.id, payload);
      load(); close();
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const handleStock = async () => {
    if (!cantidad || Number(cantidad) <= 0) { setFormError('Ingresa una cantidad válida.'); return; }
    setFormLoading(true); setFormError('');
    try {
      if (modal === 'aumentar') await aumentarStock(selected.id, Number(cantidad));
      else await disminuirStock(selected.id, Number(cantidad));
      load(); close();
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try { await deleteRepuesto(selected.id); load(); close(); }
    catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const columns = [
    { key: 'codigo', header: 'Código' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'stock', header: 'Stock', render: r => (
      <span className={`font-semibold ${r.stock <= 5 ? 'text-red-600' : r.stock <= 15 ? 'text-yellow-600' : 'text-green-600'}`}>{r.stock}</span>
    )},
    { key: 'precioUnitario', header: 'Precio Unit.', render: r => `$${Number(r.precioUnitario).toLocaleString('es-CL')}` },
    {
      key: 'acciones', header: 'Acciones',
      render: r => (
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => openStock(r, 'aumentar')} title="Aumentar stock"
            className="px-2 py-1 rounded text-xs bg-green-50 text-green-700 hover:bg-green-100 font-medium transition-colors">+Stock</button>
          <button onClick={() => openStock(r, 'disminuir')} title="Disminuir stock"
            className="px-2 py-1 rounded text-xs bg-yellow-50 text-yellow-700 hover:bg-yellow-100 font-medium transition-colors">-Stock</button>
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-slate-500 hover:bg-yellow-50 hover:text-yellow-600 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button onClick={() => openDelete(r)} className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      )
    }
  ];

  return (
    <Layout title="Repuestos">
      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
      <div className="flex items-center justify-between mb-4 gap-4">
        <input type="text" placeholder="Buscar por nombre o código…" value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 max-w-sm px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <Button onClick={openCreate}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo Repuesto
        </Button>
      </div>
      <Table columns={columns} data={filtered} loading={loading} emptyMessage="No hay repuestos registrados." />

      <Modal isOpen={modal === 'create' || modal === 'edit'} onClose={close} title={modal === 'create' ? 'Nuevo Repuesto' : 'Editar Repuesto'}
        footer={<><Button variant="secondary" onClick={close}>Cancelar</Button><Button type="submit" form="rep-form" loading={formLoading}>Guardar</Button></>}>
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <form id="rep-form" onSubmit={handleSave} className="space-y-3">
          <Input label="Código" id="codigo" value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} required placeholder="REP-001" />
          <Input label="Nombre" id="nombre" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
          <Input label="Stock inicial" id="stock" type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required />
          <Input label="Precio unitario ($)" id="precio" type="number" min="0" step="1" value={form.precioUnitario} onChange={e => setForm(f => ({ ...f, precioUnitario: e.target.value }))} required />
        </form>
      </Modal>

      <Modal isOpen={modal === 'aumentar' || modal === 'disminuir'} onClose={close}
        title={modal === 'aumentar' ? `Aumentar stock — ${selected?.nombre}` : `Disminuir stock — ${selected?.nombre}`} size="sm"
        footer={<><Button variant="secondary" onClick={close}>Cancelar</Button><Button onClick={handleStock} loading={formLoading}>{modal === 'aumentar' ? 'Aumentar' : 'Disminuir'}</Button></>}>
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <p className="text-sm text-slate-500 mb-3">Stock actual: <strong>{selected?.stock}</strong></p>
        <Input label="Cantidad" id="cantidad" type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} required />
      </Modal>

      <Modal isOpen={modal === 'delete'} onClose={close} title="Eliminar Repuesto" size="sm"
        footer={<><Button variant="secondary" onClick={close}>Cancelar</Button><Button variant="danger" onClick={handleDelete} loading={formLoading}>Eliminar</Button></>}>
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <p className="text-slate-600 text-sm">¿Eliminar el repuesto <strong>{selected?.nombre}</strong>? Esta acción no se puede deshacer.</p>
      </Modal>
    </Layout>
  );
}
