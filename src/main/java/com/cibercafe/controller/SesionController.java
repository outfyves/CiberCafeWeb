package com.cibercafe.controller;

import com.cibercafe.model.Sesion;
import com.cibercafe.repository.SesionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controlador API REST para el Control de Sesiones de uso de equipos.
 * Implementa la lógica de inicio y finalización del servicio de alquiler.
 */
@RestController
@RequestMapping("/api/sesiones")
public class SesionController {

    @Autowired
    private SesionRepository sesionRepository;

    /**
     * Recupera el historial reciente de sesiones (Top 10) para el Dashboard.
     */
    @GetMapping
    public List<Sesion> listarTodas() {
        return sesionRepository.findTop10ByOrderByFechaInicioDesc();
    }

    /**
     * Registra el inicio de una nueva sesión de alquiler.
     */
    @PostMapping
    public Sesion iniciarSesion(@RequestBody Sesion sesion) {
        sesion.setFechaInicio(LocalDateTime.now());
        sesion.setEstado("activa");
        return sesionRepository.save(sesion);
    }

    /**
     * Finaliza una sesión activa, registrando la hora de cierre y el monto total cobrado.
     */
    @PutMapping("/{id}/finalizar")
    public Sesion finalizarSesion(@PathVariable Long id, @RequestBody Sesion detalles) {
        Sesion sesion = sesionRepository.findById(id).orElse(null);
        if (sesion != null) {
            sesion.setFechaFin(LocalDateTime.now());
            sesion.setTotal(detalles.getTotal());
            sesion.setEstado("finalizada");
            return sesionRepository.save(sesion);
        }
        return null;
    }
}
