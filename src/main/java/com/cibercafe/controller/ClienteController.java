package com.cibercafe.controller;

import com.cibercafe.model.Cliente;
import com.cibercafe.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador API REST para la gestión de Clientes.
 * Proporciona endpoints para operaciones CRUD.
 */
@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    /**
     * Obtiene la lista completa de clientes registrados.
     */
    @GetMapping
    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    /**
     * Registra un nuevo cliente en la base de datos.
     */
    @PostMapping
    public Cliente crear(@RequestBody Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    /**
     * Obtiene el detalle de un cliente específico por su ID.
     */
    @GetMapping("/{id}")
    public Cliente obtenerPorId(@PathVariable Long id) {
        return clienteRepository.findById(id).orElse(null);
    }

    /**
     * Elimina un cliente del sistema.
     */
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        clienteRepository.deleteById(id);
    }

    /**
     * Actualiza la información de un cliente existente.
     */
    @PutMapping("/{id}")
    public Cliente actualizar(@PathVariable Long id, @RequestBody Cliente clienteDetalles) {
        Cliente cliente = clienteRepository.findById(id).orElse(null);
        if (cliente != null) {
            cliente.setNombre(clienteDetalles.getNombre());
            cliente.setApellido(clienteDetalles.getApellido());
            cliente.setCedula(clienteDetalles.getCedula());
            cliente.setCorreo(clienteDetalles.getCorreo());
            cliente.setTelefono(clienteDetalles.getTelefono());
            cliente.setEstado(clienteDetalles.getEstado());
            return clienteRepository.save(cliente);
        }
        return null;
    }
}
