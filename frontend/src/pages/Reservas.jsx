import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import { getReservas, createReserva } from '../api/reservas';
import { getClientes, getVehiculosByCliente } from '../api/clientes';

const ESTADOS_RESERVA = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA'];
const EMPTY_FORM = { fecha: '', hora: '', motivo: '', estado: 'PENDIENTE', clienteId: '', vehiculoId: '' };

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vehiculosCliente, setVehiculosCliente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [vehLoading, setVehLoading] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getReservas(), getClientes()])
      .then(([res, cls]) => { setReservas(res); setClientes(cls); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleClienteChange = async (clienteId) => {
    setForm((f) => ({ ...f, clienteId, vehiculoId: '' }));
    if (!clienteId) { setVehiculosCliente([]); return; }
    setVehLoading(true);
    try {
      const vehs = await getVehiculosByCliente(clienteId);
      setVehiculosCliente(vehs);
    } catch {
      setVehiculosCliente([]);
    } finally {
      setVehLoading(false);
    }
  };

  const openModal = () => { setForm(EMPTY_FORM); setFormError(''); setVehiculosCliente([]); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      const hora = form.hora.length === 5 ? form.hora + ':00' : form.hora;
      await createReserva({
        fecha: form.fecha,
        hora,
        motivo: form.motivo,
        estado: form.estado,
        clienteId: Number(form.clienteId),
        vehiculoId: Number(form.vehiculoId),
      });
      load();
      closeModal();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    { key: 'fecha', header: 'Fecha' },
    { key: 'hora', header: 'Hora', render: (r) => r.hora?.slice(0, 5) },
    { key: 'cliente', header: 'Cliente', render: (r) => r.cliente?.nombre ?? '—' },
    { key: 'vehiculo', header: 'Vehículo', render: (r) => r.vehiculo ? `${r.vehiculo.patente} – ${r.vehiculo.marca}` : '—' },
    { key: 'motivo', header: 'Motivo' },
    { key: 'estado', header: 'Estado', render: (r) => <Badge status={r.estado} /> },
  ];

  return (
    <Layout title="Reservas">
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="flex justify-end mb-4">
        <Button onClick={openModal}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nueva Reserva
        </Button>
      </div>

      <Table columns={columns} data={reservas} loading={loading} emptyMessage="No hay reservas registradas." />

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title="Nueva Reserva"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" form="reserva-form" loading={formLoading}>Agendar</Button>
          </>
        }
      >
        {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
        <form id="reserva-form" onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Fecha"
              id="fecha"
              type="date"
              value={form.fecha}
              onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
              required
            />
            <Input
              label="Hora"
              id="hora"
              type="time"
              value={form.hora}
              onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Cliente <span className="text-red-500">*</span></label>
            <select
              required
              value={form.clienteId}
              onChange={(e) => handleClienteChange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar cliente…</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre} ({c.rut})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Vehículo <span className="text-red-500">*</span></label>
            <select
              required
              value={form.vehiculoId}
              onChange={(e) => setForm((f) => ({ ...f, vehiculoId: e.target.value }))}
              disabled={!form.clienteId || vehLoading}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">{vehLoading ? 'Cargando…' : 'Seleccionar vehículo…'}</option>
              {vehiculosCliente.map((v) => (
                <option key={v.id} value={v.id}>{v.patente} – {v.marca} {v.modelo}</option>
              ))}
            </select>
          </div>

          <Input
            label="Motivo"
            id="motivo"
            value={form.motivo}
            onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}
            placeholder="Ej: Revisión de frenos, cambio de aceite…"
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Estado</label>
            <select
              value={form.estado}
              onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ESTADOS_RESERVA.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
