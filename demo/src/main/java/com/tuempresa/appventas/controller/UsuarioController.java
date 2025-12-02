package com.tuempresa.appventas.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tuempresa.appventas.model.Usuario;
import com.tuempresa.appventas.service.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/usuarios/";

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
        // Crear directorio si no existe
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
    }

    // OBTENER TODOS LOS USUARIOS
    @GetMapping
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        try {
            List<Usuario> usuarios = usuarioService.obtenerTodos();
            return ResponseEntity.ok(usuarios);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // OBTENER USUARIO POR ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerUsuario(@PathVariable Long id) {
        try {
            Optional<Usuario> usuario = usuarioService.obtenerPorId(id);
            return usuario.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ACTUALIZAR USUARIO
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable Long id,
                                               @RequestBody Usuario usuarioActualizado) {
        try {
            Usuario usuario = usuarioService.actualizarUsuario(id, usuarioActualizado);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ACTUALIZAR DATOS DE PAGO
    @PutMapping("/{id}/datos-pago")
    public ResponseEntity<?> actualizarDatosPago(
            @PathVariable Long id,
            @RequestParam(required = false) String deunaNumero,
            @RequestParam(required = false) String bancoNombre,
            @RequestParam(required = false) String bancoNumeroCuenta,
            @RequestParam(required = false) String bancoTipoCuenta) {
        try {
            Optional<Usuario> optUsuario = usuarioService.obtenerPorId(id);
            if (optUsuario.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Usuario usuario = optUsuario.get();
            if (deunaNumero != null) usuario.setDeunaNumero(deunaNumero);
            if (bancoNombre != null) usuario.setBancoNombre(bancoNombre);
            if (bancoNumeroCuenta != null) usuario.setBancoNumeroCuenta(bancoNumeroCuenta);
            if (bancoTipoCuenta != null) usuario.setBancoTipoCuenta(bancoTipoCuenta);
            
            Usuario actualizado = usuarioService.guardar(usuario);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // SUBIR QR DE DEUNA
    @PostMapping("/{id}/qr-deuna")
    public ResponseEntity<?> subirQrDeuna(@PathVariable Long id, @RequestParam("qr") MultipartFile archivo) {
        try {
            Optional<Usuario> optUsuario = usuarioService.obtenerPorId(id);
            if (optUsuario.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            if (archivo.isEmpty()) {
                return ResponseEntity.badRequest().body("No se recibió ningún archivo");
            }

            // Validar tipo de archivo
            String contentType = archivo.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("El archivo debe ser una imagen");
            }

            // Generar nombre único
            String extension = archivo.getOriginalFilename().substring(archivo.getOriginalFilename().lastIndexOf("."));
            String fileName = "qr_" + id + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
            
            Path path = Paths.get(UPLOAD_DIR + fileName);
            Files.write(path, archivo.getBytes());
            
            String qrUrl = "/uploads/usuarios/" + fileName;
            
            Usuario usuario = optUsuario.get();
            usuario.setDeunaQrUrl(qrUrl);
            usuarioService.guardar(usuario);
            
            Map<String, String> response = new HashMap<>();
            response.put("qrUrl", qrUrl);
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error al guardar el archivo");
        }
    }

    // CAMBIAR ESTADO (para moderadores)
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id,
                                           @RequestParam String nuevoEstado) {
        try {
            Usuario usuario = usuarioService.cambiarEstadoUsuario(id, nuevoEstado);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // VERIFICAR CUENTA
    @PutMapping("/{id}/verificar")
    public ResponseEntity<?> verificarCuenta(@PathVariable Long id) {
        try {
            Usuario usuario = usuarioService.verificarCuenta(id);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // CAMBIAR TIPO DE USUARIO (ADMIN)
    @PutMapping("/{id}/tipo")
    public ResponseEntity<?> cambiarTipoUsuario(@PathVariable Long id, @RequestParam String nuevoTipo) {
        try {
            Usuario usuario = usuarioService.cambiarTipoUsuario(id, nuevoTipo);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}