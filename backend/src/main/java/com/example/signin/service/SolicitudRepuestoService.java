package com.example.signin.service;

import com.example.signin.dto.SolicitudRepuestoDTO;
import com.example.signin.model.OrdenTrabajo;
import com.example.signin.model.Repuesto;
import com.example.signin.model.SolicitudRepuesto;
import com.example.signin.repository.OrdenTrabajoRepository;
import com.example.signin.repository.RepuestoRepository;
import com.example.signin.repository.SolicitudRepuestoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SolicitudRepuestoService {

    private final SolicitudRepuestoRepository solicitudRepuestoRepository;
    private final OrdenTrabajoRepository ordenTrabajoRepository;
    private final RepuestoRepository repuestoRepository;

    public SolicitudRepuestoService(SolicitudRepuestoRepository solicitudRepuestoRepository,
                                    OrdenTrabajoRepository ordenTrabajoRepository,
                                    RepuestoRepository repuestoRepository) {
        this.solicitudRepuestoRepository = solicitudRepuestoRepository;
        this.ordenTrabajoRepository = ordenTrabajoRepository;
        this.repuestoRepository = repuestoRepository;
    }

    public List<SolicitudRepuesto> listarSolicitudes() {
        return solicitudRepuestoRepository.findAll();
    }

    public SolicitudRepuesto obtenerPorId(Long id) {
        return solicitudRepuestoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
    }

    public List<SolicitudRepuesto> obtenerPorOrden(Long ordenTrabajoId) {
        return solicitudRepuestoRepository.findByOrdenTrabajoId(ordenTrabajoId);
    }

    public List<SolicitudRepuesto> obtenerPorEstado(String estado) {
        return solicitudRepuestoRepository.findByEstado(estado);
    }

    public SolicitudRepuesto crearSolicitud(SolicitudRepuestoDTO dto) {
        OrdenTrabajo orden = ordenTrabajoRepository.findById(dto.getOrdenTrabajoId())
                .orElseThrow(() -> new RuntimeException("Orden de trabajo no encontrada"));
        Repuesto repuesto = repuestoRepository.findById(dto.getRepuestoId())
                .orElseThrow(() -> new RuntimeException("Repuesto no encontrado"));
        if (dto.getCantidad() == null || dto.getCantidad() <= 0) {
            throw new RuntimeException("La cantidad solicitada debe ser mayor a 0");
        }
        if (repuesto.getStock() < dto.getCantidad()) {
            throw new RuntimeException("Stock insuficiente para la solicitud");
        }
        SolicitudRepuesto solicitud = new SolicitudRepuesto();
        solicitud.setOrdenTrabajo(orden);
        solicitud.setRepuesto(repuesto);
        solicitud.setCantidad(dto.getCantidad());
        solicitud.setEstado(dto.getEstado());
        repuesto.setStock(repuesto.getStock() - dto.getCantidad());
        repuestoRepository.save(repuesto);
        orden.setEstado("ESPERANDO_REPUESTOS");
        ordenTrabajoRepository.save(orden);
        return solicitudRepuestoRepository.save(solicitud);
    }

    public void eliminarSolicitud(Long id) {
        solicitudRepuestoRepository.deleteById(id);
    }
}
