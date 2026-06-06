package com.example.signin.repository;

import com.example.signin.model.OrdenTrabajo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrdenTrabajoRepository extends JpaRepository<OrdenTrabajo, Long> {

    List<OrdenTrabajo> findByVehiculoId(Integer vehiculoId);

    List<OrdenTrabajo> findByEstado(String estado);
}