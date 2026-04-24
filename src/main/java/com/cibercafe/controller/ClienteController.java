package com.cibercafe.controller;

import com.cibercafe.model.Cliente;
import com.cibercafe.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador API REST para Clientes.
 * Expone los endpoints para interactuar con la base de datos desde el Frontend.
 */
@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    // Obtener todos los clientes
    @GetMapping
    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    // Crear un nuevo cliente
    @PostMapping
    public Cliente guardar(@RequestBody Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    // Obtener un cliente por ID
    @GetMapping("/{id}")
    public Cliente obtenerPorId(@PathVariable Long id) {
        return clienteRepository.findById(id).orElse(null);
    }

    // Eliminar un cliente
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        clienteRepository.deleteById(id);
    }

    // Actualizar un cliente
    @PutMapping("/{id}")
    public Cliente actualizar(@PathVariable Long id, @RequestBody Cliente clienteDetalles) {
        Cliente cliente = clienteRepository.findById(id).orElse(null);
        if (cliente != null) {
            cliente.setNombre(clienteDetalles.getNombre());
            cliente.setApellido(clienteDetalles.getApellido());
            cliente.setCedula(clienteDetalles.getCedula());
            cliente.setCorreo(clienteDetalles.getCorreo());
            cliente.setTelefono(clienteDetalles.getTelefono());
            return clienteRepository.save(cliente);
        }
        return null;
    }
}
