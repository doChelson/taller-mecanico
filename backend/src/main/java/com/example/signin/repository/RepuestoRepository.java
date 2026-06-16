package com.example.signin.repository;

import com.example.signin.model.Repuesto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RepuestoRepository extends JpaRepository<Repuesto, Long> {
    List<Repuesto> findByStockLessThanEqual(Integer limite);
}
