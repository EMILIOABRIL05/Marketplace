package com.tuempresa.appventas.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tuempresa.appventas.model.DetallePedido;
import com.tuempresa.appventas.model.Pedido;
import com.tuempresa.appventas.service.PedidoService;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @PostMapping("/{usuarioId}/crear")
    public ResponseEntity<Pedido> crearPedido(
            @PathVariable Long usuarioId, 
            @RequestParam(required = false, defaultValue = "TRANSFERENCIA") String metodoPago) {
        return ResponseEntity.ok(pedidoService.crearPedidoDesdeCarrito(usuarioId, metodoPago));
    }

    @PostMapping("/{pedidoId}/comprobante")
    public ResponseEntity<Pedido> subirComprobante(@PathVariable Long pedidoId, @RequestParam("archivo") MultipartFile archivo) {
        try {
            return ResponseEntity.ok(pedidoService.subirComprobante(pedidoId, archivo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{pedidoId}/confirmar")
    public ResponseEntity<Pedido> confirmarPago(@PathVariable Long pedidoId) {
        return ResponseEntity.ok(pedidoService.confirmarPago(pedidoId));
    }

    @GetMapping("/compras/{usuarioId}")
    public ResponseEntity<List<Pedido>> misCompras(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(pedidoService.obtenerMisCompras(usuarioId));
    }

    @GetMapping("/ventas/{vendedorId}")
    public ResponseEntity<List<DetallePedido>> misVentas(@PathVariable Long vendedorId) {
        return ResponseEntity.ok(pedidoService.obtenerMisVentas(vendedorId));
    }
}
