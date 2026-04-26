package com.cibercafe.controller;

import com.cibercafe.model.Configuracion;
import com.cibercafe.repository.ConfiguracionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/configuracion")
public class ConfiguracionController {

    @Autowired
    private ConfiguracionRepository configuracionRepository;

    @GetMapping
    public Map<String, String> obtenerTodas() {
        List<Configuracion> lista = configuracionRepository.findAll();
        Map<String, String> mapa = new HashMap<>();
        for (Configuracion c : lista) {
            mapa.put(c.getClave(), c.getValor());
        }
        return mapa;
    }

    @PostMapping
    public Map<String, String> guardar(@RequestBody Map<String, String> configuraciones) {
        for (Map.Entry<String, String> entry : configuraciones.entrySet()) {
            Configuracion c = new Configuracion(entry.getKey(), entry.getValue());
            configuracionRepository.save(c);
        }
        return configuraciones;
    }
}
