package com.cibercafe.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

/**
 * Entidad Equipo ajustada a la base de datos existente.
 */
@Entity
@Table(name = "equipos")
public class Equipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_equipo")
    private Long id;

    @Column(name = "numero_equipo")
    private String nombre; // Lo mapeamos a nombre para no romper el JS

    @Column(name = "descripcion")
    private String tipo;   // Lo mapeamos a tipo para no romper el JS

    @Column(name = "estado")
    private String estado;

    // Como en tu DB actual no hay precio_hora, lo dejamos como opcional o nulo por ahora
    private Double precioHora;

    public Equipo() {}

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
