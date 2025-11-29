package com.tuempresa.appventas.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tuempresa.appventas.model.Carrito;
import com.tuempresa.appventas.service.CarritoService;

@RestController
@RequestMapping("/api/carrito")
@CrossOrigin(origins = "*")
public class CarritoController {

    private static final Logger logger = LoggerFactory.getLogger(CarritoController.class);

    @Autowired
    private CarritoService carritoService;

    @GetMapping("/{usuarioId}")
    public ResponseEntity<Carrito> obtenerCarrito(@PathVariable Long usuarioId) {
        Carrito carrito = carritoService.obtenerCarritoPorUsuario(usuarioId);
        // Log para depurar datos de Deuna
        if (carrito.getItems() != null) {
            carrito.getItems().forEach(item -> {
                if (item.getProducto() != null) {
                    logger.info("🛒 Producto en carrito: {} | deunaNumero: {} | deunaQrUrl: {}", 
                        item.getProducto().getNombre(),
                        item.getProducto().getDeunaNumero(),
                        item.getProducto().getDeunaQrUrl());
                }
            });
        }
        return ResponseEntity.ok(carrito);
    }

    @PostMapping("/{usuarioId}/agregar")
    public ResponseEntity<Carrito> agregarProducto(
            @PathVariable Long usuarioId,
            @RequestParam Long productoId,
            @RequestParam Integer cantidad) {
        return ResponseEntity.ok(carritoService.agregarProducto(usuarioId, productoId, cantidad));
    }

    @DeleteMapping("/{usuarioId}/eliminar/{productoId}")
    public ResponseEntity<Carrito> eliminarProducto(
            @PathVariable Long usuarioId,
            @PathVariable Long productoId) {
        return ResponseEntity.ok(carritoService.eliminarProducto(usuarioId, productoId));
    }
    
    @PutMapping("/{usuarioId}/actualizar")
    public ResponseEntity<Carrito> actualizarCantidad(
            @PathVariable Long usuarioId,
            @RequestParam Long productoId,
            @RequestParam Integer cantidad) {
        return ResponseEntity.ok(carritoService.actualizarCantidad(usuarioId, productoId, cantidad));
    }

    @DeleteMapping("/{usuarioId}/vaciar")
    public ResponseEntity<Void> vaciarCarrito(@PathVariable Long usuarioId) {
        carritoService.vaciarCarrito(usuarioId);
        return ResponseEntity.ok().build();
    }
}
