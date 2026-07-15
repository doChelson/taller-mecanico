import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { getVehiculos, updateVehiculo, deleteVehiculo } from '../api/vehiculos';

const EMPTY_FORM = { marca: '', modelo: '', anio: '', kilometraje: '' };

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () => {
    setLoading(true);
    getVehiculos()
      .then(setVehiculos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = vehiculos.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.patente?.toLowerCase().includes(q) ||
      v.marca?.toLowerCase().includes(q) ||
      v.modelo?.toLowerCase().includes(q)
    );
  });

  const openEdit = (v) => {
    setSelected(v);
    setForm({
      marca: v.marca ?? '',
      modelo: v.modelo ?? '',
      anio: v.anio ?? '',
      kilometraje: v.kilometraje ?? '',
    });
    setFormError('');
    setModal('edit');
  };
  const openDelete = (v) => { setSelected(v); setFormError(''); setModal('delete'); };
  const close = () => { setModal(null); setSelected(null); };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      await updateVehiculo(selected.id, {
        marca: form.marca,
        modelo: form.modelo,
        anio: Number(form.anio),
        kilometraje: Number(form.kilometraje),
      });
      load();
      close();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    setFormError('');
    try {
      await deleteVehiculo(selected.id);
      load();
      close();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    { key: 'patente', header: 'Patente' },
    { key: 'marca', header: 'Marca' },
    { key: 'modelo', header: 'Modelo' },
    { key: 'anio', header: 'Año' },
    { key: 'kilometraje', header: 'Kilometraje', render: (v) => v.kilometraje != null ? `${v.kilometraje.toLocaleString('es-CL')} km` : '—' },
    {
      key: 'acciones', header: 'Acciones',
      render: (v) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(v)} title="Editar"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onClick={() => openDelete(v)} title="Eliminar"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout title="Vehículos">
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por patente, marca o modelo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Table columns={columns} data={filtered} loading={loading} emptyMessage="No hay vehículos registrados." />

      <p className="mt-3 text-xs text-slate-400">
        Para agregar un vehículo, ve a la sección <strong>Clientes</strong> y selecciona el cliente correspondiente.
      </p>

      {/* Edit modal */}
      <Modal
        isOpen={modal === 'edit'}
        onClose={close}
        title={`Editar ${selected?.patente ?? 'Vehículo'}`}
        footer={
          <>
            <Button variant="secondary" onClick={close}>Cancelar</Button>
            <Button type="submit" form="veh-form" loading={formLoading}>Guardar cambios</Button>
          </>
        }
      >
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <form id="veh-form" onSubmit={handleEdit} className="space-y-3">
          <p className="text-xs text-slate-400">La patente no se puede modificar porque identifica al vehículo.</p>
          <Input label="Marca" id="marca" value={form.marca} onChange={(e) => setForm((f) => ({ ...f, marca: e.target.value }))} required />
          <Input label="Modelo" id="modelo" value={form.modelo} onChange={(e) => setForm((f) => ({ ...f, modelo: e.target.value }))} required />
          <Input label="Año" id="anio" type="number" value={form.anio} onChange={(e) => setForm((f) => ({ ...f, anio: e.target.value }))} required />
          <Input label="Kilometraje" id="kilometraje" type="number" min="0" value={form.kilometraje} onChange={(e) => setForm((f) => ({ ...f, kilometraje: e.target.value }))} required />
        </form>
      </Modal>

      {/* Delete modal */}
      <Modal
        isOpen={modal === 'delete'}
        onClose={close}
        title="Eliminar Vehículo"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={close}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete} loading={formLoading}>Eliminar</Button>
          </>
        }
      >
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <p className="text-slate-600 text-sm">
          ¿Estás seguro de que deseas eliminar el vehículo <strong>{selected?.patente}</strong>? Esta acción no se puede deshacer.
        </p>
      </Modal>
    </Layout>
  );
}
