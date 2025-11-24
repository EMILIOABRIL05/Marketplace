package com.tuempresa.appventas.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.tuempresa.appventas.model.Reporte;
import com.tuempresa.appventas.service.ReporteService;
import com.tuempresa.appventas.service.UsuarioService;
import com.tuempresa.appventas.service.ProductoService;
import com.tuempresa.appventas.service.ServicioService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
public class ReporteController {

    private final ReporteService reporteService;
    private final UsuarioService usuarioService;
    private final ProductoService productoService;
    private final ServicioService servicioService;

    public ReporteController(ReporteService reporteService, UsuarioService usuarioService,
                             ProductoService productoService, ServicioService servicioService) {
        this.reporteService = reporteService;
        this.usuarioService = usuarioService;
        this.productoService = productoService;
        this.servicioService = servicioService;
    }

    @PostMapping
    public ResponseEntity<?> crearReporte(@RequestBody Map<String, Object> request) {
        try {
            Long usuarioId = Long.parseLong(request.get("usuarioId").toString());
            String motivo = request.get("motivo").toString();
            String descripcion = request.get("descripcion").toString();

            var usuario = usuarioService.obtenerPorId(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            Reporte reporte;

            // 🆕 SOPORTE PARA PRODUCTOS Y SERVICIOS
            if (request.containsKey("productoId") && request.get("productoId") != null) {
                // Reportar producto
                Long productoId = Long.parseLong(request.get("productoId").toString());
                var producto = productoService.obtenerPorId(productoId);
                reporte = reporteService.crearReporteProducto(usuario, producto, motivo, descripcion);
            }
            else if (request.containsKey("servicioId") && request.get("servicioId") != null) {
                // Reportar servicio
                Long servicioId = Long.parseLong(request.get("servicioId").toString());
                var servicio = servicioService.obtenerServicioPorId(servicioId)
                        .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
                reporte = reporteService.crearReporteServicio(usuario, servicio, motivo, descripcion);
            }
            else {
                return ResponseEntity.badRequest().body("Debe proporcionar productoId o servicioId");
            }

            return ResponseEntity.ok(reporte);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear reporte: " + e.getMessage());
        }
    }

    @GetMapping("/pendientes")
    public ResponseEntity<List<Reporte>> obtenerReportesPendientes() {
        try {
            List<Reporte> reportes = reporteService.obtenerReportesPendientes();
            return ResponseEntity.ok(reportes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<Reporte>> obtenerReportesProducto(@PathVariable Long productoId) {
        try {
            List<Reporte> reportes = reporteService.obtenerReportesProducto(productoId);
            return ResponseEntity.ok(reportes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // 🆕 NUEVO: Obtener reportes de un servicio
    @GetMapping("/servicio/{servicioId}")
    public ResponseEntity<List<Reporte>> obtenerReportesServicio(@PathVariable Long servicioId) {
        try {
            List<Reporte> reportes = reporteService.obtenerReportesServicio(servicioId);
            return ResponseEntity.ok(reportes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}