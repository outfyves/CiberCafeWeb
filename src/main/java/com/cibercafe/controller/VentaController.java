package com.cibercafe.controller;

import com.cibercafe.model.Producto;
import com.cibercafe.model.Venta;
import com.cibercafe.repository.ProductoRepository;
import com.cibercafe.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @GetMapping
    public List<Venta> listarTodas() {
        return ventaRepository.findAll();
    }

    @PostMapping
    public Venta procesarVenta(@RequestBody Map<String, Object> payload) {
        // Extraer datos del payload enviado desde el JS
        Double total = Double.valueOf(payload.get("total").toString());
        String detalle = payload.get("detalle").toString();
        List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("items");

        // 1. Guardar la venta
        Venta venta = new Venta();
        venta.setTotal(total);
        venta.setDetalle(detalle);
        ventaRepository.save(venta);

        // 2. Descontar stock de productos
        for (Map<String, Object> item : items) {
            Long productoId = Long.valueOf(item.get("id").toString());
            Integer cantidadVendida = Integer.valueOf(item.get("cantidad").toString());
            
            Producto p = productoRepository.findById(productoId).orElse(null);
            if (p != null) {
                p.setStock(p.getStock() - cantidadVendida);
                productoRepository.save(p);
            }
        }

        return venta;
    }
}
