package com.example.signin.controller;

import com.example.signin.dto.OrdenTrabajoDTO;
import com.example.signin.model.OrdenTrabajo;
import com.example.signin.service.OrdenTrabajoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ordenes")
@CrossOrigin(origins = "*")
public class OrdenTrabajoController {

    private final OrdenTrabajoService ordenTrabajoService;

    public OrdenTrabajoController(OrdenTrabajoService ordenTrabajoService) {
        this.ordenTrabajoService = ordenTrabajoService;
    }

    @GetMapping
    public List<OrdenTrabajo> listarOrdenes() {
        return ordenTrabajoService.listarOrdenes();
    }

    @GetMapping("/{id}")
    public OrdenTrabajo obtenerPorId(@PathVariable Long id) {
        return ordenTrabajoService.obtenerPorId(id);
    }

    @GetMapping("/vehiculo/{vehiculoId}")
    public List<OrdenTrabajo> obtenerPorVehiculo(@PathVariable Integer vehiculoId) {
        return ordenTrabajoService.obtenerPorVehiculo(vehiculoId);
    }

    @GetMapping("/estado/{estado}")
    public List<OrdenTrabajo> obtenerPorEstado(@PathVariable String estado) {
        return ordenTrabajoService.obtenerPorEstado(estado);
    }

    @PostMapping
    public OrdenTrabajo crearOrden(@RequestBody OrdenTrabajoDTO dto) {
        return ordenTrabajoService.crearOrden(dto);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        ordenTrabajoService.eliminar(id);
    }
}