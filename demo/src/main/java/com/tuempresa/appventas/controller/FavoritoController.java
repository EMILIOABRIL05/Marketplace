package com.tuempresa.appventas.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.tuempresa.appventas.model.Favorito;
import com.tuempresa.appventas.service.FavoritoService;
import com.tuempresa.appventas.service.UsuarioService;
import com.tuempresa.appventas.service.ProductoService;
import com.tuempresa.appventas.service.ServicioService;
import java.util.List;

@RestController
@RequestMapping("/api/favoritos")
@CrossOrigin(origins = "*")
public class FavoritoController {

    private final FavoritoService favoritoService;
    private final UsuarioService usuarioService;
    private final ProductoService productoService;
    private final ServicioService servicioService;

    public FavoritoController(FavoritoService favoritoService, UsuarioService usuarioService,
                              ProductoService productoService, ServicioService servicioService) {
        this.favoritoService = favoritoService;
        this.usuarioService = usuarioService;
        this.productoService = productoService;
        this.servicioService = servicioService;
    }

    @PostMapping
    public ResponseEntity<?> agregarFavorito(
            @RequestParam Long usuarioId,
            @RequestParam(required = false) Long productoId,
            @RequestParam(required = false) Long servicioId) {
        try {
            var usuario = usuarioService.obtenerPorId(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            Favorito favorito;

            if (productoId != null) {
                var producto = productoService.obtenerPorId(productoId);
                favorito = favoritoService.agregarFavoritoProducto(usuario, producto);
            } else if (servicioId != null) {
                var servicio = servicioService.obtenerServicioPorId(servicioId)
                        .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
                favorito = favoritoService.agregarFavoritoServicio(usuario, servicio);
            } else {
                return ResponseEntity.badRequest().body("Debe proporcionar productoId o servicioId");
            }

            return ResponseEntity.ok(favorito);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping
    public ResponseEntity<?> eliminarFavorito(
            @RequestParam Long usuarioId,
            @RequestParam(required = false) Long productoId,
            @RequestParam(required = false) Long servicioId) {
        try {
            if (productoId != null) {
                favoritoService.eliminarFavoritoProducto(usuarioId, productoId);
            } else if (servicioId != null) {
                favoritoService.eliminarFavoritoServicio(usuarioId, servicioId);
            } else {
                return ResponseEntity.badRequest().body("Debe proporcionar productoId o servicioId");
            }

            return ResponseEntity.ok("Favorito eliminado");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Favorito>> obtenerFavoritos(@PathVariable Long usuarioId) {
        try {
            List<Favorito> favoritos = favoritoService.obtenerFavoritosUsuario(usuarioId);
            return ResponseEntity.ok(favoritos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> esFavorito(
            @RequestParam Long usuarioId,
            @RequestParam(required = false) Long productoId,
            @RequestParam(required = false) Long servicioId) {

        boolean esFav;

        if (productoId != null) {
            esFav = favoritoService.esFavoritoProducto(usuarioId, productoId);
        } else if (servicioId != null) {
            esFav = favoritoService.esFavoritoServicio(usuarioId, servicioId);
        } else {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(esFav);
    }
}