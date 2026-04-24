package com.cibercafe.controller;

import com.cibercafe.model.Producto;
import com.cibercafe.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    @GetMapping
    public List<Producto> listar() {
        List<Producto> productos = productoRepository.findAll();
        // Si no hay productos, creamos los iniciales por defecto
        if (productos.isEmpty()) {
            crearProductosIniciales();
            return productoRepository.findAll();
        }
        return productos;
    }

    @PutMapping("/{id}/stock")
    public Producto actualizarStock(@PathVariable Long id, @RequestParam Integer cantidad) {
        Producto p = productoRepository.findById(id).orElse(null);
        if (p != null) {
            p.setStock(p.getStock() + cantidad);
            return productoRepository.save(p);
        }
        return null;
    }

    private void crearProductosIniciales() {
        List<Producto> iniciales = new ArrayList<>();
        
        Producto p1 = new Producto();
        p1.setNombre("Coca Cola 600ml"); p1.setCategoria("bebidas"); p1.setPrecio(18.0); p1.setStock(24); p1.setIcono("fa-wine-bottle");
        iniciales.add(p1);

        Producto p2 = new Producto();
        p2.setNombre("Papas Originales"); p2.setCategoria("snacks"); p2.setPrecio(15.0); p2.setStock(10); p2.setIcono("fa-cookie");
        iniciales.add(p2);

        Producto p3 = new Producto();
        p3.setNombre("Agua Natural"); p3.setCategoria("bebidas"); p3.setPrecio(12.0); p3.setStock(15); p3.setIcono("fa-tint");
        iniciales.add(p3);

        productoRepository.saveAll(iniciales);
    }
}
