import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import {
  getClientes, createCliente, updateCliente, deleteCliente,
  getVehiculosByCliente, createVehiculoForCliente,
} from '../api/clientes';

const EMPTY_FORM = { rut: '', nombre: '', telefono: '', email: '', direccion: '' };
const EMPTY_VEH = { patente: '', marca: '', modelo: '', anio: '', kilometraje: '' };

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete' | 'vehiculos'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [vehiculos, setVehiculos] = useState([]);
  const [vehLoading, setVehLoading] = useState(false);
  const [vehForm, setVehForm] = useState(EMPTY_VEH);
  const [vehFormVisible, setVehFormVisible] = useState(false);
  const [vehFormLoading, setVehFormLoading] = useState(false);
  const [vehFormError, setVehFormError] = useState('');

  const load = () => {
    setLoading(true);
    getClientes()
      .then(setClientes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = clientes.filter((c) => {
    const q = search.toLowerCase();
    return c.nombre?.toLowerCase().includes(q) || c.rut?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
  });

  const openCreate = () => { setForm(EMPTY_FORM); setFormError(''); setModal('create'); };
  const openEdit = (c) => { setSelected(c); setForm({ rut: c.rut, nombre: c.nombre, telefono: c.telefono ?? '', email: c.email, direccion: c.direccion ?? '' }); setFormError(''); setModal('edit'); };
  const openDelete = (c) => { setSelected(c); setModal('delete'); };
  const openVehiculos = (c) => {
    setSelected(c);
    setVehForm(EMPTY_VEH);
    setVehFormVisible(false);
    setVehFormError('');
    setModal('vehiculos');
    setVehLoading(true);
    getVehiculosByCliente(c.id)
      .then(setVehiculos)
      .catch(() => setVehiculos([]))
      .finally(() => setVehLoading(false));
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleFormChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      if (modal === 'create') await createCliente(form);
      else await updateCliente(selected.id, form);
      load();
      closeModal();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await deleteCliente(selected.id);
      load();
      closeModal();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleVehFormChange = (field) => (e) => setVehForm((f) => ({ ...f, [field]: e.target.value }));

  const handleAddVehiculo = async (e) => {
    e.preventDefault();
    setVehFormLoading(true);
    setVehFormError('');
    try {
      const payload = { ...vehForm, anio: Number(vehForm.anio), kilometraje: Number(vehForm.kilometraje) };
      await createVehiculoForCliente(selected.id, payload);
      setVehForm(EMPTY_VEH);
      setVehFormVisible(false);
      const updated = await getVehiculosByCliente(selected.id);
      setVehiculos(updated);
    } catch (err) {
      setVehFormError(err.message);
    } finally {
      setVehFormLoading(false);
    }
  };

  const columns = [
    { key: 'rut', header: 'RUT' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'telefono', header: 'Teléfono' },
    { key: 'email', header: 'Email' },
    { key: 'direccion', header: 'Dirección' },
    {
      key: 'acciones', header: 'Acciones',
      render: (c) => (
        <div className="flex gap-1">
          <button onClick={() => openVehiculos(c)} title="Ver vehículos"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1h8zM13 16h2l4-4-1-5h-5v9z" /></svg>
          </button>
          <button onClick={() => openEdit(c)} title="Editar"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-yellow-50 hover:text-yellow-600 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button onClick={() => openDelete(c)} title="Eliminar"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      ),
    },
  ];

  const vehColumns = [
    { key: 'patente', header: 'Patente' },
    { key: 'marca', header: 'Marca' },
    { key: 'modelo', header: 'Modelo' },
    { key: 'anio', header: 'Año' },
    { key: 'kilometraje', header: 'Kilometraje', render: (v) => v.kilometraje?.toLocaleString('es-CL') + ' km' },
  ];

  return (
    <Layout title="Clientes">
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="flex items-center justify-between mb-4 gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre, RUT o email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-sm px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={openCreate}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo Cliente
        </Button>
      </div>

      <Table columns={columns} data={filtered} loading={loading} emptyMessage="No hay clientes registrados." />

      {/* Create / Edit modal */}
      <Modal
        isOpen={modal === 'create' || modal === 'edit'}
        onClose={closeModal}
        title={modal === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" form="cliente-form" loading={formLoading}>Guardar</Button>
          </>
        }
      >
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <form id="cliente-form" onSubmit={handleSave} className="space-y-3">
          <Input label="RUT" id="rut" value={form.rut} onChange={handleFormChange('rut')} required placeholder="12.345.678-9" />
          <Input label="Nombre" id="nombre" value={form.nombre} onChange={handleFormChange('nombre')} required />
          <Input label="Teléfono" id="telefono" value={form.telefono} onChange={handleFormChange('telefono')} />
          <Input label="Email" id="email" type="email" value={form.email} onChange={handleFormChange('email')} required />
          <Input label="Dirección" id="direccion" value={form.direccion} onChange={handleFormChange('direccion')} />
        </form>
      </Modal>

      {/* Delete modal */}
      <Modal
        isOpen={modal === 'delete'}
        onClose={closeModal}
        title="Eliminar Cliente"
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
          ¿Estás seguro de que deseas eliminar al cliente <strong>{selected?.nombre}</strong>?
          Esta acción también eliminará sus vehículos asociados.
        </p>
      </Modal>

      {/* Vehiculos modal */}
      <Modal
        isOpen={modal === 'vehiculos'}
        onClose={closeModal}
        title={`Vehículos de ${selected?.nombre ?? ''}`}
        size="lg"
      >
        <Table columns={vehColumns} data={vehiculos} loading={vehLoading} emptyMessage="Este cliente no tiene vehículos." />

        <div className="mt-4">
          {!vehFormVisible ? (
            <Button variant="secondary" onClick={() => setVehFormVisible(true)}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Agregar Vehículo
            </Button>
          ) : (
            <div className="border border-slate-200 rounded-xl p-4 mt-2">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Nuevo Vehículo</h4>
              {vehFormError && <p className="mb-3 text-sm text-red-600">{vehFormError}</p>}
              <form onSubmit={handleAddVehiculo} className="grid grid-cols-2 gap-3">
                <Input label="Patente" id="patente" value={vehForm.patente} onChange={handleVehFormChange('patente')} required placeholder="ABCD12" />
                <Input label="Marca" id="marca" value={vehForm.marca} onChange={handleVehFormChange('marca')} required />
                <Input label="Modelo" id="modelo" value={vehForm.modelo} onChange={handleVehFormChange('modelo')} required />
                <Input label="Año" id="anio" type="number" value={vehForm.anio} onChange={handleVehFormChange('anio')} required placeholder="2020" />
                <Input label="Kilometraje" id="kilometraje" type="number" value={vehForm.kilometraje} onChange={handleVehFormChange('kilometraje')} required placeholder="50000" />
                <div className="col-span-2 flex gap-2 justify-end">
                  <Button variant="secondary" onClick={() => setVehFormVisible(false)}>Cancelar</Button>
                  <Button type="submit" loading={vehFormLoading}>Guardar</Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </Modal>
    </Layout>
  );
}
