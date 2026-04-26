package com.cibercafe.controller;

import com.cibercafe.model.Equipo;
import com.cibercafe.repository.EquipoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador API REST para administrar el inventario de equipos (PCs).
 * Gestiona el estado de disponibilidad y mantenimiento de las terminales.
 */
@RestController
@RequestMapping("/api/equipos")
public class EquipoController {

    @Autowired
    private EquipoRepository equipoRepository;

    /**
     * Lista todos los equipos configurados en el sistema.
     */
    @GetMapping
    public List<Equipo> listarTodos() {
        return equipoRepository.findAll();
    }

    /**
     * Obtiene un equipo individual por ID.
     */
    @GetMapping("/{id}")
    public Equipo obtenerPorId(@PathVariable Long id) {
        return equipoRepository.findById(id).orElse(null);
    }

    /**
     * Registra una nueva terminal en el inventario.
     */
    @PostMapping
    public Equipo crear(@RequestBody Equipo equipo) {
        return equipoRepository.save(equipo);
    }

    /**
     * Elimina un equipo del inventario.
     */
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        equipoRepository.deleteById(id);
    }

    /**
     * Actualiza el estado o la configuración de una terminal.
     */
    @PutMapping("/{id}")
    public Equipo actualizar(@PathVariable Long id, @RequestBody Equipo equipoDetalles) {
        Equipo equipo = equipoRepository.findById(id).orElse(null);
        if (equipo != null) {
            equipo.setNombre(equipoDetalles.getNombre());
            equipo.setTipo(equipoDetalles.getTipo());
            equipo.setEstado(equipoDetalles.getEstado());
            equipo.setPrecioHora(equipoDetalles.getPrecioHora());
            return equipoRepository.save(equipo);
        }
        return null;
    }
}
