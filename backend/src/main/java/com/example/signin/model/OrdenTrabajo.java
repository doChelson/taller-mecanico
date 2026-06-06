package com.example.signin.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orden_trabajo")
public class OrdenTrabajo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 30, unique = true)
    private String numero;

    @Column(name = "fecha_ingreso", nullable = false, updatable = false)
    private LocalDateTime fechaIngreso;

    @Column(nullable = false, length = 30)
    private String estado;

    @Column(name = "diagnostico_preliminar", length = 1000)
    private String diagnosticoPreliminar;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = false)
    @JsonIgnoreProperties({"cliente"})
    private Vehiculo vehiculo;

    @PrePersist
    protected void onCreate() {
        this.fechaIngreso = LocalDateTime.now();

        if (this.estado == null || this.estado.isBlank()) {
            this.estado = "CREADA";
        }

        if (this.numero == null || this.numero.isBlank()) {
            this.numero = "OT-" + System.currentTimeMillis();
        }
    }

    public OrdenTrabajo() {}

    public Long getId() {
        return id;
    }

    public String getNumero() {
        return numero;
    }

    public LocalDateTime getFechaIngreso() {
        return fechaIngreso;
    }

    public String getEstado() {
        return estado;
    }

    public String getDiagnosticoPreliminar() {
        return diagnosticoPreliminar;
    }

    public Vehiculo getVehiculo() {
        return vehiculo;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public void setFechaIngreso(LocalDateTime fechaIngreso) {
        this.fechaIngreso = fechaIngreso;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public void setDiagnosticoPreliminar(String diagnosticoPreliminar) {
        this.diagnosticoPreliminar = diagnosticoPreliminar;
    }

    public void setVehiculo(Vehiculo vehiculo) {
        this.vehiculo = vehiculo;
    }
}