package com.tuempresa.appventas.controller;

import com.tuempresa.appventas.model.Apelacion;
import com.tuempresa.appventas.model.Incidencia;
import com.tuempresa.appventas.model.Usuario;
import com.tuempresa.appventas.service.ApelacionService;
import com.tuempresa.appventas.service.IncidenciaService;
import com.tuempresa.appventas.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/apelaciones")
@CrossOrigin(origins = "*")
public class ApelacionController {

    @Autowired
    private ApelacionService apelacionService;

    @Autowired
    private IncidenciaService incidenciaService;

    @Autowired
    private UsuarioService usuarioService;

    // Crear apelación
    @PostMapping
    public ResponseEntity<?> crearApelacion(@RequestBody Map<String, Object> request) {
        try {
            Long incidenciaId = Long.parseLong(request.get("incidenciaId").toString());
            Long vendedorId = Long.parseLong(request.get("vendedorId").toString());
            String motivo = request.get("motivo").toString();
            String justificacion = request.get("justificacion").toString();

            Incidencia incidencia = incidenciaService.obtenerIncidenciaPorId(incidenciaId);
            Usuario vendedor = usuarioService.obtenerPorId(vendedorId)
                    .orElseThrow(() -> new RuntimeException("Vendedor no encontrado"));

            Apelacion apelacion = apelacionService.crearApelacion(incidencia, vendedor, motivo, justificacion);
            return ResponseEntity.ok(apelacion);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Asignar apelación a moderador
    @PutMapping("/{id}/asignar")
    public ResponseEntity<?> asignarApelacion(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Long moderadorId = Long.parseLong(request.get("moderadorId").toString());
            Usuario moderador = usuarioService.obtenerPorId(moderadorId)
                    .orElseThrow(() -> new RuntimeException("Moderador no encontrado"));

            Apelacion apelacion = apelacionService.asignarApelacion(id, moderador);
            return ResponseEntity.ok(apelacion);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Resolver apelación
    @PutMapping("/{id}/resolver")
    public ResponseEntity<?> resolverApelacion(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String decisionFinal = request.get("decisionFinal");
            String comentario = request.get("comentario");

            Apelacion apelacion = apelacionService.resolverApelacion(id, decisionFinal, comentario);
            return ResponseEntity.ok(apelacion);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Obtener todas las apelaciones
    @GetMapping
    public ResponseEntity<List<Apelacion>> obtenerTodasApelaciones() {
        try {
            List<Apelacion> apelaciones = apelacionService.obtenerTodasApelaciones();
            return ResponseEntity.ok(apelaciones);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener apelaciones pendientes
    @GetMapping("/pendientes")
    public ResponseEntity<List<Apelacion>> obtenerApelacionesPendientes() {
        try {
            List<Apelacion> apelaciones = apelacionService.obtenerApelacionesPendientes();
            return ResponseEntity.ok(apelaciones);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener apelaciones por vendedor
    @GetMapping("/vendedor/{vendedorId}")
    public ResponseEntity<List<Apelacion>> obtenerApelacionesPorVendedor(@PathVariable Long vendedorId) {
        try {
            List<Apelacion> apelaciones = apelacionService.obtenerApelacionesPorVendedor(vendedorId);
            return ResponseEntity.ok(apelaciones);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener apelaciones por moderador
    @GetMapping("/moderador/{moderadorId}")
    public ResponseEntity<List<Apelacion>> obtenerApelacionesPorModerador(@PathVariable Long moderadorId) {
        try {
            List<Apelacion> apelaciones = apelacionService.obtenerApelacionesPorModerador(moderadorId);
            return ResponseEntity.ok(apelaciones);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener apelación por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerApelacionPorId(@PathVariable Long id) {
        try {
            Apelacion apelacion = apelacionService.obtenerApelacionPorId(id);
            return ResponseEntity.ok(apelacion);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
