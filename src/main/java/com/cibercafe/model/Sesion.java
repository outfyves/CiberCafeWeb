package com.cibercafe.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad que registra el historial de alquiler de equipos.
 * Almacena el inicio, fin y el cobro total de cada sesión de uso.
 */
@Entity
@Table(name = "registro_sesiones")
public class Sesion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sesion")
    private Long id;

    private String cliente;
    private String equipo;
    
    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;
    
    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;
    
    private Double total;
    private String estado; // "activa" o "finalizada"

    public Sesion() {
        this.fechaInicio = LocalDateTime.now();
        this.estado = "activa";
    }

    // Getters y Setters para persistencia de datos
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }

    public String getEquipo() { return equipo; }
    public void setEquipo(String equipo) { this.equipo = equipo; }

    public LocalDateTime getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDateTime fechaInicio) { this.fechaInicio = fechaInicio; }

    public LocalDateTime getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDateTime fechaFin) { this.fechaFin = fechaFin; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
