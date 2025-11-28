package com.tuempresa.appventas.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tuempresa.appventas.model.Valoracion;
import com.tuempresa.appventas.service.ValoracionService;

@RestController
@RequestMapping("/api/valoraciones")
public class ValoracionController {

    @Autowired
    private ValoracionService valoracionService;

    @PostMapping
    public ResponseEntity<?> crearValoracion(@RequestBody Map<String, Object> payload) {
        try {
            Long vendedorId = Long.parseLong(payload.get("vendedorId").toString());
            Long compradorId = Long.parseLong(payload.get("compradorId").toString());
            int calificacion = Integer.parseInt(payload.get("calificacion").toString());
            String comentario = payload.get("comentario") != null ? payload.get("comentario").toString() : null;

            Valoracion valoracion = valoracionService.crearValoracion(vendedorId, compradorId, calificacion, comentario);
            return ResponseEntity.ok(valoracion);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> obtenerValoraciones(@RequestParam Long vendedorId) {
        List<Map<String, Object>> valoraciones = valoracionService.obtenerValoracionesPorVendedor(vendedorId)
            .stream()
            .map(valoracion -> {
                Map<String, Object> data = new HashMap<>();
                data.put("id", valoracion.getId());
                data.put("calificacion", valoracion.getCalificacion());
                data.put("comentario", valoracion.getComentario());
                data.put("fechaCreacion", valoracion.getFechaCreacion());
                data.put("compradorNombre", valoracion.getComprador().getNombre());
                data.put("compradorApellido", valoracion.getComprador().getApellido());
                return data;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(valoraciones);
    }

    @GetMapping("/resumen")
    public ResponseEntity<Map<String, Object>> obtenerResumen(@RequestParam Long vendedorId) {
        Map<String, Object> resumen = valoracionService.obtenerResumenValoraciones(vendedorId);
        return ResponseEntity.ok(resumen);
    }

    @GetMapping("/verificar")
    public ResponseEntity<Map<String, Boolean>> verificarValoracion(@RequestParam Long vendedorId, @RequestParam Long compradorId) {
        boolean yaValorado = valoracionService.yaHaValorado(vendedorId, compradorId);
        return ResponseEntity.ok(Map.of("yaValorado", yaValorado));
    }
}
