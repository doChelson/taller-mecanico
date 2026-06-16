package com.example.signin.service;

import com.example.signin.dto.AvanceReparacionDTO;
import com.example.signin.model.AvanceReparacion;
import com.example.signin.model.OrdenTrabajo;
import com.example.signin.repository.AvanceReparacionRepository;
import com.example.signin.repository.OrdenTrabajoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AvanceReparacionService {

    private final AvanceReparacionRepository avanceReparacionRepository;
    private final OrdenTrabajoRepository ordenTrabajoRepository;

    public AvanceReparacionService(AvanceReparacionRepository avanceReparacionRepository,
                                   OrdenTrabajoRepository ordenTrabajoRepository) {
        this.avanceReparacionRepository = avanceReparacionRepository;
        this.ordenTrabajoRepository = ordenTrabajoRepository;
    }

    public List<AvanceReparacion> listarAvances() {
        return avanceReparacionRepository.findAll();
    }

    public AvanceReparacion obtenerPorId(Long id) {
        return avanceReparacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Avance no encontrado"));
    }

    public List<AvanceReparacion> obtenerPorOrden(Long ordenTrabajoId) {
        return avanceReparacionRepository.findByOrdenTrabajoId(ordenTrabajoId);
    }

    public List<AvanceReparacion> obtenerPorEstado(String estado) {
        return avanceReparacionRepository.findByEstado(estado);
    }

    public AvanceReparacion crearAvance(AvanceReparacionDTO dto) {
        OrdenTrabajo orden = ordenTrabajoRepository.findById(dto.getOrdenTrabajoId())
                .orElseThrow(() -> new RuntimeException("Orden de trabajo no encontrada"));
        AvanceReparacion avance = new AvanceReparacion();
        avance.setDescripcion(dto.getDescripcion());
        avance.setPorcentajeAvance(dto.getPorcentajeAvance());
        avance.setEstado(dto.getEstado());
        avance.setOrdenTrabajo(orden);
        if (dto.getPorcentajeAvance() != null && dto.getPorcentajeAvance() >= 100) {
            orden.setEstado("FINALIZADA");
        } else {
            orden.setEstado("EN_REPARACION");
        }
        ordenTrabajoRepository.save(orden);
        return avanceReparacionRepository.save(avance);
    }

    public AvanceReparacion actualizarAvance(Long id, AvanceReparacionDTO dto) {
        AvanceReparacion avance = avanceReparacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Avance no encontrado"));
        avance.setDescripcion(dto.getDescripcion());
        avance.setPorcentajeAvance(dto.getPorcentajeAvance());
        avance.setEstado(dto.getEstado());
        OrdenTrabajo orden = avance.getOrdenTrabajo();
        if (dto.getPorcentajeAvance() != null && dto.getPorcentajeAvance() >= 100) {
            orden.setEstado("FINALIZADA");
        } else {
            orden.setEstado("EN_REPARACION");
        }
        ordenTrabajoRepository.save(orden);
        return avanceReparacionRepository.save(avance);
    }

    public void eliminarAvance(Long id) {
        avanceReparacionRepository.deleteById(id);
    }
}
