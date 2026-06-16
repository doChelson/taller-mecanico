import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { getMecanicos, createMecanico, updateMecanico, deleteMecanico } from '../api/mecanicos';

const EMPTY = { rut: '', nombre: '', especialidad: '', disponible: true };

export default function Mecanicos() {
  const [mecanicos, setMecanicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () => {
    setLoading(true);
    getMecanicos().then(setMecanicos).catch(e => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = mecanicos.filter(m => {
    const q = search.toLowerCase();
    return m.nombre?.toLowerCase().includes(q) || m.rut?.toLowerCase().includes(q) || m.especialidad?.toLowerCase().includes(q);
  });

  const openCreate = () => { setForm(EMPTY); setFormError(''); setModal('create'); };
  const openEdit = (m) => { setSelected(m); setForm({ rut: m.rut, nombre: m.nombre, especialidad: m.especialidad ?? '', disponible: m.disponible }); setFormError(''); setModal('edit'); };
  const openDelete = (m) => { setSelected(m); setFormError(''); setModal('delete'); };
  const close = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true); setFormError('');
    try {
      const payload = { ...form, disponible: form.disponible === true || form.disponible === 'true' };
      if (modal === 'create') await createMecanico(payload);
      else await updateMecanico(selected.id, payload);
      load(); close();
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try { await deleteMecanico(selected.id); load(); close(); }
    catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const columns = [
    { key: 'rut', header: 'RUT' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'especialidad', header: 'Especialidad', render: m => m.especialidad || '—' },
    { key: 'disponible', header: 'Estado', render: m => <Badge status={m.disponible ? 'DISPONIBLE' : 'NO_DISPONIBLE'} /> },
    {
      key: 'acciones', header: 'Acciones',
      render: m => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg text-slate-500 hover:bg-yellow-50 hover:text-yellow-600 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button onClick={() => openDelete(m)} className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      )
    }
  ];

  return (
    <Layout title="Mecánicos">
      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
      <div className="flex items-center justify-between mb-4 gap-4">
        <input type="text" placeholder="Buscar por nombre, RUT o especialidad…" value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 max-w-sm px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <Button onClick={openCreate}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo Mecánico
        </Button>
      </div>
      <Table columns={columns} data={filtered} loading={loading} emptyMessage="No hay mecánicos registrados." />

      <Modal isOpen={modal === 'create' || modal === 'edit'} onClose={close} title={modal === 'create' ? 'Nuevo Mecánico' : 'Editar Mecánico'}
        footer={<><Button variant="secondary" onClick={close}>Cancelar</Button><Button type="submit" form="mec-form" loading={formLoading}>Guardar</Button></>}>
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <form id="mec-form" onSubmit={handleSave} className="space-y-3">
          <Input label="RUT" id="rut" value={form.rut} onChange={e => setForm(f => ({ ...f, rut: e.target.value }))} required placeholder="12.345.678-9" />
          <Input label="Nombre" id="nombre" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
          <Input label="Especialidad" id="especialidad" value={form.especialidad} onChange={e => setForm(f => ({ ...f, especialidad: e.target.value }))} placeholder="Ej: Motor, Frenos, Electricidad" />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Disponibilidad</label>
            <select value={String(form.disponible)} onChange={e => setForm(f => ({ ...f, disponible: e.target.value === 'true' }))}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="true">Disponible</option>
              <option value="false">No disponible</option>
            </select>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modal === 'delete'} onClose={close} title="Eliminar Mecánico" size="sm"
        footer={<><Button variant="secondary" onClick={close}>Cancelar</Button><Button variant="danger" onClick={handleDelete} loading={formLoading}>Eliminar</Button></>}>
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <p className="text-slate-600 text-sm">¿Eliminar al mecánico <strong>{selected?.nombre}</strong>? Esta acción no se puede deshacer.</p>
      </Modal>
    </Layout>
  );
}
