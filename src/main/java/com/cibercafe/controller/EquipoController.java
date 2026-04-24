package com.cibercafe.controller;

import com.cibercafe.model.Equipo;
import com.cibercafe.repository.EquipoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipos")
public class EquipoController {

    @Autowired
    private EquipoRepository equipoRepository;

    @GetMapping
    public List<Equipo> listarTodos() {
        return equipoRepository.findAll();
    }

    @PostMapping
    public Equipo guardar(@RequestBody Equipo equipo) {
        if (equipo.getEstado() == null) equipo.setEstado("DISPONIBLE");
        return equipoRepository.save(equipo);
    }

    @GetMapping("/{id}")
    public Equipo obtenerPorId(@PathVariable Long id) {
        return equipoRepository.findById(id).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        equipoRepository.deleteById(id);
    }

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
