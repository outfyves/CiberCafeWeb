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
        
        // Bebidas
        iniciales.add(new Producto("Coca Cola 600ml", "bebidas", 18.0, 24, "fa-wine-bottle"));
        iniciales.add(new Producto("Agua Natural", "bebidas", 12.0, 15, "fa-tint"));
        iniciales.add(new Producto("Café Americano", "bebidas", 15.0, 30, "fa-coffee"));
        iniciales.add(new Producto("Energizante RedBull", "bebidas", 45.0, 10, "fa-bolt"));
        iniciales.add(new Producto("Té Frío", "bebidas", 20.0, 12, "fa-leaf"));

        // Snacks
        iniciales.add(new Producto("Papas Originales", "snacks", 15.0, 10, "fa-cookie"));
        iniciales.add(new Producto("Galletas de Chocolate", "snacks", 12.0, 20, "fa-cookie-bite"));
        iniciales.add(new Producto("Sándwich de Jamón", "snacks", 35.0, 5, "fa-bread-slice"));
        iniciales.add(new Producto("Chocolatina Jet", "snacks", 5.0, 50, "fa-candy-cane"));
        iniciales.add(new Producto("Maní Salado", "snacks", 10.0, 15, "fa-seedling"));

        // Servicios / Otros
        iniciales.add(new Producto("Impresión B/N", "servicios", 2.0, 500, "fa-print"));
        iniciales.add(new Producto("Impresión Color", "servicios", 5.0, 200, "fa-palette"));
        iniciales.add(new Producto("Escaneo de Documento", "servicios", 10.0, 100, "fa-copy"));
        iniciales.add(new Producto("Audífonos (Venta)", "otros", 150.0, 5, "fa-headphones"));

        productoRepository.saveAll(iniciales);
    }
}
