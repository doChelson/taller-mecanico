package com.example.signin.service;

import com.example.signin.dto.PresupuestoDTO;
import com.example.signin.model.OrdenTrabajo;
import com.example.signin.model.Presupuesto;
import com.example.signin.model.SolicitudRepuesto;
import com.example.signin.repository.OrdenTrabajoRepository;
import com.example.signin.repository.PresupuestoRepository;
import com.example.signin.repository.SolicitudRepuestoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PresupuestoService {

    private final PresupuestoRepository presupuestoRepository;
    private final OrdenTrabajoRepository ordenTrabajoRepository;
    private final SolicitudRepuestoRepository solicitudRepuestoRepository;

    public PresupuestoService(PresupuestoRepository presupuestoRepository,
                              OrdenTrabajoRepository ordenTrabajoRepository,
                              SolicitudRepuestoRepository solicitudRepuestoRepository) {
        this.presupuestoRepository = presupuestoRepository;
        this.ordenTrabajoRepository = ordenTrabajoRepository;
        this.solicitudRepuestoRepository = solicitudRepuestoRepository;
    }

    public List<Presupuesto> listarPresupuestos() {
        return presupuestoRepository.findAll();
    }

    public Presupuesto obtenerPorId(Long id) {
        return presupuestoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado"));
    }

    public Presupuesto obtenerPorOrden(Long ordenTrabajoId) {
        return presupuestoRepository.findByOrdenTrabajoId(ordenTrabajoId)
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado para esta orden"));
    }

    public Presupuesto crearPresupuesto(PresupuestoDTO dto) {
        OrdenTrabajo orden = ordenTrabajoRepository.findById(dto.getOrdenTrabajoId())
                .orElseThrow(() -> new RuntimeException("Orden de trabajo no encontrada"));
        if (presupuestoRepository.findByOrdenTrabajoId(dto.getOrdenTrabajoId()).isPresent()) {
            throw new RuntimeException("Esta orden ya tiene un presupuesto generado");
        }
        List<SolicitudRepuesto> solicitudes = solicitudRepuestoRepository.findByOrdenTrabajoId(dto.getOrdenTrabajoId());
        double montoRepuestos = 0;
        for (SolicitudRepuesto solicitud : solicitudes) {
            montoRepuestos += solicitud.getCantidad() * solicitud.getRepuesto().getPrecioUnitario();
        }
        double manoObra = dto.getManoObra() != null ? dto.getManoObra() : 0;
        double montoTotal = montoRepuestos + manoObra;

        Presupuesto presupuesto = new Presupuesto();
        presupuesto.setOrdenTrabajo(orden);
        presupuesto.setMontoRepuestos(montoRepuestos);
        presupuesto.setManoObra(manoObra);
        presupuesto.setMontoTotal(montoTotal);
        presupuesto.setDetalle(dto.getDetalle());
        presupuesto.setEstadoAprobacion("PENDIENTE");
        orden.setEstado("PRESUPUESTADA");
        ordenTrabajoRepository.save(orden);
        return presupuestoRepository.save(presupuesto);
    }

    public Presupuesto aprobarPresupuesto(Long id) {
        Presupuesto presupuesto = presupuestoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado"));
        presupuesto.setEstadoAprobacion("APROBADO");
        OrdenTrabajo orden = presupuesto.getOrdenTrabajo();
        orden.setEstado("PRESUPUESTO_APROBADO");
        ordenTrabajoRepository.save(orden);
        return presupuestoRepository.save(presupuesto);
    }

    public Presupuesto rechazarPresupuesto(Long id) {
        Presupuesto presupuesto = presupuestoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado"));
        presupuesto.setEstadoAprobacion("RECHAZADO");
        OrdenTrabajo orden = presupuesto.getOrdenTrabajo();
        orden.setEstado("PRESUPUESTO_RECHAZADO");
        ordenTrabajoRepository.save(orden);
        return presupuestoRepository.save(presupuesto);
    }

    public void eliminarPresupuesto(Long id) {
        presupuestoRepository.deleteById(id);
    }
}
