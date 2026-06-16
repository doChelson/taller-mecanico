package com.example.signin.service;

import com.example.signin.dto.RepuestoDTO;
import com.example.signin.model.Repuesto;
import com.example.signin.repository.RepuestoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RepuestoService {

    private final RepuestoRepository repuestoRepository;

    public RepuestoService(RepuestoRepository repuestoRepository) {
        this.repuestoRepository = repuestoRepository;
    }

    public List<Repuesto> listarRepuestos() {
        return repuestoRepository.findAll();
    }

    public Repuesto obtenerPorId(Long id) {
        return repuestoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Repuesto no encontrado"));
    }

    public List<Repuesto> obtenerStockBajo(Integer limite) {
        return repuestoRepository.findByStockLessThanEqual(limite);
    }

    public Repuesto crearRepuesto(RepuestoDTO dto) {
        Repuesto repuesto = new Repuesto();
        repuesto.setCodigo(dto.getCodigo());
        repuesto.setNombre(dto.getNombre());
        repuesto.setStock(dto.getStock());
        repuesto.setPrecioUnitario(dto.getPrecioUnitario());
        return repuestoRepository.save(repuesto);
    }

    public Repuesto actualizarRepuesto(Long id, RepuestoDTO dto) {
        Repuesto repuesto = repuestoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Repuesto no encontrado"));
        repuesto.setCodigo(dto.getCodigo());
        repuesto.setNombre(dto.getNombre());
        repuesto.setStock(dto.getStock());
        repuesto.setPrecioUnitario(dto.getPrecioUnitario());
        return repuestoRepository.save(repuesto);
    }

    public Repuesto aumentarStock(Long id, Integer cantidad) {
        Repuesto repuesto = repuestoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Repuesto no encontrado"));
        if (cantidad == null || cantidad <= 0) throw new RuntimeException("La cantidad debe ser mayor a 0");
        repuesto.setStock(repuesto.getStock() + cantidad);
        return repuestoRepository.save(repuesto);
    }

    public Repuesto disminuirStock(Long id, Integer cantidad) {
        Repuesto repuesto = repuestoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Repuesto no encontrado"));
        if (cantidad == null || cantidad <= 0) throw new RuntimeException("La cantidad debe ser mayor a 0");
        if (repuesto.getStock() < cantidad) throw new RuntimeException("Stock insuficiente");
        repuesto.setStock(repuesto.getStock() - cantidad);
        return repuestoRepository.save(repuesto);
    }

    public Repuesto ajustarStock(Long id, Integer cantidad) {
        Repuesto repuesto = repuestoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Repuesto no encontrado"));
        if (cantidad == null || cantidad < 0) throw new RuntimeException("El stock no puede ser negativo");
        repuesto.setStock(cantidad);
        return repuestoRepository.save(repuesto);
    }

    public void eliminarRepuesto(Long id) {
        repuestoRepository.deleteById(id);
    }
}
