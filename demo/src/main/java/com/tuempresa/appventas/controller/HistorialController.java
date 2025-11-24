package com.tuempresa.appventas.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.tuempresa.appventas.model.Historial;
import com.tuempresa.appventas.service.HistorialService;
import com.tuempresa.appventas.service.UsuarioService;
import com.tuempresa.appventas.service.ProductoService;
import com.tuempresa.appventas.service.ServicioService;
import java.util.List;

@RestController
@RequestMapping("/api/historial")
@CrossOrigin(origins = "*")
public class HistorialController {

    private final HistorialService historialService;
    private final UsuarioService usuarioService;
    private final ProductoService productoService;
    private final ServicioService servicioService;

    public HistorialController(HistorialService historialService,
                               UsuarioService usuarioService,
                               ProductoService productoService,
                               ServicioService servicioService) {
        this.historialService = historialService;
        this.usuarioService = usuarioService;
        this.productoService = productoService;
        this.servicioService = servicioService;
    }

    @PostMapping
    public ResponseEntity<?> registrarVista(
            @RequestParam Long usuarioId,
            @RequestParam(required = false) Long productoId,
            @RequestParam(required = false) Long servicioId,
            @RequestParam(required = false, defaultValue = "VISTO") String estado) {

        try {
            var usuario = usuarioService.obtenerPorId(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            if (productoId != null) {
                var producto = productoService.obtenerPorId(productoId);
                Historial historial = historialService.registrarVista(usuario, producto, null, estado);
                return ResponseEntity.ok(historial);
            } else if (servicioId != null) {
                var servicio = servicioService.obtenerServicioPorId(servicioId)
                        .orElseThrow(() -> new RuntimeException("Servicio no encontrado con ID: " + servicioId));
                Historial historial = historialService.registrarVista(usuario, null, servicio, estado);
                return ResponseEntity.ok(historial);
            } else {
                return ResponseEntity.badRequest().body("Debe proporcionar productoId o servicioId");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{historialId}/completar")
    public ResponseEntity<?> marcarComoCompletado(@PathVariable Long historialId) {
        try {
            Historial historial = historialService.marcarComoCompletado(historialId);
            return ResponseEntity.ok(historial);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Historial>> obtenerHistorial(@PathVariable Long usuarioId) {
        try {
            List<Historial> historial = historialService.obtenerHistorialUsuario(usuarioId);
            return ResponseEntity.ok(historial);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}