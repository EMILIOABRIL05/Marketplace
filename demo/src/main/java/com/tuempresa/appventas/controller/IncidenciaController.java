package com.tuempresa.appventas.controller;

import com.tuempresa.appventas.model.*;
import com.tuempresa.appventas.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidencias")
@CrossOrigin(origins = "*")
public class IncidenciaController {

    @Autowired
    private IncidenciaService incidenciaService;

    @Autowired
    private ProductoService productoService;

    @Autowired
    private ServicioService servicioService;

    @Autowired
    private UsuarioService usuarioService;

    // Crear incidencia por reporte de comprador (producto)
    @PostMapping("/reportar/producto")
    public ResponseEntity<?> reportarProducto(@RequestBody Map<String, Object> request) {
        try {
            Long productoId = Long.parseLong(request.get("productoId").toString());
            Long reportadorId = Long.parseLong(request.get("reportadorId").toString());
            String descripcion = request.get("descripcion").toString();

            Producto producto = productoService.obtenerPorId(productoId);
            Usuario reportador = usuarioService.obtenerPorId(reportadorId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            Incidencia incidencia = incidenciaService.crearIncidenciaReporte(producto, reportador, descripcion);
            return ResponseEntity.ok(incidencia);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Crear incidencia por reporte de comprador (servicio)
    @PostMapping("/reportar/servicio")
    public ResponseEntity<?> reportarServicio(@RequestBody Map<String, Object> request) {
        try {
            Long servicioId = Long.parseLong(request.get("servicioId").toString());
            Long reportadorId = Long.parseLong(request.get("reportadorId").toString());
            String descripcion = request.get("descripcion").toString();

            Servicio servicio = servicioService.obtenerServicioPorId(servicioId)
                    .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
            Usuario reportador = usuarioService.obtenerPorId(reportadorId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            Incidencia incidencia = incidenciaService.crearIncidenciaReporte(servicio, reportador, descripcion);
            return ResponseEntity.ok(incidencia);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Crear incidencia por moderador (producto)
    @PostMapping("/moderador/producto")
    public ResponseEntity<?> reportarProductoPorModerador(@RequestBody Map<String, Object> request) {
        try {
            Long productoId = Long.parseLong(request.get("productoId").toString());
            Long moderadorId = Long.parseLong(request.get("moderadorId").toString());
            String descripcion = request.get("descripcion").toString();

            Producto producto = productoService.obtenerPorId(productoId);
            Usuario moderador = usuarioService.obtenerPorId(moderadorId)
                    .orElseThrow(() -> new RuntimeException("Moderador no encontrado"));

            Incidencia incidencia = incidenciaService.crearIncidenciaModerador(producto, moderador, descripcion);
            return ResponseEntity.ok(incidencia);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Crear incidencia por moderador (servicio)
    @PostMapping("/moderador/servicio")
    public ResponseEntity<?> reportarServicioPorModerador(@RequestBody Map<String, Object> request) {
        try {
            Long servicioId = Long.parseLong(request.get("servicioId").toString());
            Long moderadorId = Long.parseLong(request.get("moderadorId").toString());
            String descripcion = request.get("descripcion").toString();

            Servicio servicio = servicioService.obtenerServicioPorId(servicioId)
                    .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
            Usuario moderador = usuarioService.obtenerPorId(moderadorId)
                    .orElseThrow(() -> new RuntimeException("Moderador no encontrado"));

            Incidencia incidencia = incidenciaService.crearIncidenciaModerador(servicio, moderador, descripcion);
            return ResponseEntity.ok(incidencia);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Asignar incidencia a moderador
    @PutMapping("/{id}/asignar")
    public ResponseEntity<?> asignarIncidencia(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Long moderadorId = Long.parseLong(request.get("moderadorId").toString());
            Usuario moderador = usuarioService.obtenerPorId(moderadorId)
                    .orElseThrow(() -> new RuntimeException("Moderador no encontrado"));

            Incidencia incidencia = incidenciaService.asignarIncidencia(id, moderador);
            return ResponseEntity.ok(incidencia);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Resolver incidencia
    @PutMapping("/{id}/resolver")
    public ResponseEntity<?> resolverIncidencia(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String decision = request.get("decision");
            String comentario = request.get("comentario");

            Incidencia incidencia = incidenciaService.resolverIncidencia(id, decision, comentario);
            return ResponseEntity.ok(incidencia);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Obtener todas las incidencias
    @GetMapping
    public ResponseEntity<List<Incidencia>> obtenerTodasIncidencias() {
        try {
            List<Incidencia> incidencias = incidenciaService.obtenerTodasIncidencias();
            return ResponseEntity.ok(incidencias);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener incidencias pendientes
    @GetMapping("/pendientes")
    public ResponseEntity<List<Incidencia>> obtenerIncidenciasPendientes() {
        try {
            List<Incidencia> incidencias = incidenciaService.obtenerIncidenciasPendientes();
            return ResponseEntity.ok(incidencias);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener incidencias sin asignar
    @GetMapping("/sin-asignar")
    public ResponseEntity<List<Incidencia>> obtenerIncidenciasSinAsignar() {
        try {
            List<Incidencia> incidencias = incidenciaService.obtenerIncidenciasSinAsignar();
            return ResponseEntity.ok(incidencias);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener incidencias por moderador
    @GetMapping("/moderador/{moderadorId}")
    public ResponseEntity<List<Incidencia>> obtenerIncidenciasPorModerador(@PathVariable Long moderadorId) {
        try {
            List<Incidencia> incidencias = incidenciaService.obtenerIncidenciasPorModerador(moderadorId);
            return ResponseEntity.ok(incidencias);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener incidencias por vendedor
    @GetMapping("/vendedor/{vendedorId}")
    public ResponseEntity<List<Incidencia>> obtenerIncidenciasPorVendedor(@PathVariable Long vendedorId) {
        try {
            List<Incidencia> incidencias = incidenciaService.obtenerIncidenciasPorVendedor(vendedorId);
            return ResponseEntity.ok(incidencias);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener incidencia por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerIncidenciaPorId(@PathVariable Long id) {
        try {
            Incidencia incidencia = incidenciaService.obtenerIncidenciaPorId(id);
            return ResponseEntity.ok(incidencia);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Filtrar incidencias por fecha
    @GetMapping("/filtrar")
    public ResponseEntity<?> filtrarPorFecha(
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin) {
        try {
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
            Date inicio = formatter.parse(fechaInicio);
            Date fin = formatter.parse(fechaFin);

            List<Incidencia> incidencias = incidenciaService.filtrarPorFecha(inicio, fin);
            return ResponseEntity.ok(incidencias);

        } catch (ParseException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Formato de fecha inválido. Use yyyy-MM-dd"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
