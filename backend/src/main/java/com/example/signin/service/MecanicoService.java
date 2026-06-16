package com.example.signin.service;

import com.example.signin.model.Mecanico;
import com.example.signin.repository.MecanicoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MecanicoService {

    private final MecanicoRepository mecanicoRepository;

    public MecanicoService(MecanicoRepository mecanicoRepository) {
        this.mecanicoRepository = mecanicoRepository;
    }

    public List<Mecanico> listarMecanicos() {
        return mecanicoRepository.findAll();
    }

    public List<Mecanico> listarDisponibles() {
        return mecanicoRepository.findByDisponible(true);
    }

    public Mecanico obtenerPorId(Integer id) {
        return mecanicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mecánico no encontrado"));
    }

    public Mecanico crearMecanico(Mecanico mecanico) {
        if (mecanico.getDisponible() == null) {
            mecanico.setDisponible(true);
        }
        return mecanicoRepository.save(mecanico);
    }

    public Mecanico actualizarMecanico(Integer id, Mecanico mecanicoActualizado) {
        Mecanico mecanico = mecanicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mecánico no encontrado"));
        mecanico.setRut(mecanicoActualizado.getRut());
        mecanico.setNombre(mecanicoActualizado.getNombre());
        mecanico.setEspecialidad(mecanicoActualizado.getEspecialidad());
        mecanico.setDisponible(mecanicoActualizado.getDisponible());
        return mecanicoRepository.save(mecanico);
    }

    public void eliminarMecanico(Integer id) {
        mecanicoRepository.deleteById(id);
    }
}
