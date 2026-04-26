package com.cibercafe.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

/**
 * Entidad que representa un Equipo (PC) dentro del inventario del cibercafé.
 * Controla el estado del hardware y la tarifa configurada.
 */
@Entity
@Table(name = "equipos")
public class Equipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_equipo")
    private Long id;

    @Column(name = "numero_equipo")
    private String nombre; // Ejemplo: PC-01

    @Column(name = "descripcion")
    private String tipo;   // Especificaciones técnicas

    @Column(name = "estado")
    private String estado; // DISPONIBLE, OCUPADO, MANTENIMIENTO

    @Column(name = "precio_hora")
    private Double precioHora;

    public Equipo() {}

    // Getters y Setters estándar
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Double getPrecioHora() { return precioHora; }
    public void setPrecioHora(Double precioHora) { this.precioHora = precioHora; }
}
