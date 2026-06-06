package com.example.signin.service;

import com.example.signin.dto.OrdenTrabajoDTO;
import com.example.signin.model.OrdenTrabajo;
import com.example.signin.model.Vehiculo;
import com.example.signin.repository.OrdenTrabajoRepository;
import com.example.signin.repository.VehiculoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrdenTrabajoService {

    private final OrdenTrabajoRepository ordenTrabajoRepository;
    private final VehiculoRepository vehiculoRepository;

    public OrdenTrabajoService(
            OrdenTrabajoRepository ordenTrabajoRepository,
            VehiculoRepository vehiculoRepository
    ) {
        this.ordenTrabajoRepository = ordenTrabajoRepository;
        this.vehiculoRepository = vehiculoRepository;
    }

    public List<OrdenTrabajo> listarOrdenes() {
        return ordenTrabajoRepository.findAll();
    }

    public OrdenTrabajo crearOrden(OrdenTrabajoDTO dto) {

        Vehiculo vehiculo = vehiculoRepository.findById(dto.getVehiculoId())
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));

        OrdenTrabajo orden = new OrdenTrabajo();

        orden.setEstado(dto.getEstado());
        orden.setDiagnosticoPreliminar(dto.getDiagnosticoPreliminar());
        orden.setVehiculo(vehiculo);

        return ordenTrabajoRepository.save(orden);
    }

    public List<OrdenTrabajo> obtenerPorVehiculo(Integer vehiculoId) {
        return ordenTrabajoRepository.findByVehiculoId(vehiculoId);
    }

    public List<OrdenTrabajo> obtenerPorEstado(String estado) {
        return ordenTrabajoRepository.findByEstado(estado);
    }

    public OrdenTrabajo obtenerPorId(Long id) {
        return ordenTrabajoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden no encontrada"));
    }

    public void eliminar(Long id) {
        ordenTrabajoRepository.deleteById(id);
    }
}