package com.tuempresa.appventas.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tuempresa.appventas.model.Usuario;
import com.tuempresa.appventas.service.UsuarioService;
import com.tuempresa.appventas.util.JwtUtil;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioService usuarioService;
    private final JwtUtil jwtUtil;

    public AuthController(UsuarioService usuarioService, JwtUtil jwtUtil) {
        this.usuarioService = usuarioService;
        this.jwtUtil = jwtUtil;
    }

    // REGISTRO
    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        try {
            Usuario nuevoUsuario = usuarioService.registrarUsuario(usuario);
            return ResponseEntity.ok(nuevoUsuario);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // LOGIN ACTUALIZADO - Devuelve tipoUsuario y token JWT
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Usuario usuario = usuarioService.login(loginRequest.getEmail(), loginRequest.getPassword());

            // Generar token JWT
            String token = jwtUtil.generateToken(
                usuario.getEmail(), 
                usuario.getId(), 
                usuario.getTipoUsuario()
            );

            // Crear respuesta con el usuario, su tipo y el token
            Map<String, Object> response = new HashMap<>();
            response.put("usuario", usuario);
            response.put("tipoUsuario", usuario.getTipoUsuario());
            response.put("token", token); // Token JWT para autenticación

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // Verificar email con token
    @GetMapping("/verificar-email")
    public ResponseEntity<?> verificarEmail(@RequestParam String token) {
        try {
            Usuario usuario = usuarioService.verificarEmail(token);
            return ResponseEntity.ok("Email verificado correctamente. Tu cuenta está activa.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // NUEVO: Crear administrador
    @PostMapping("/crear-admin")
    public ResponseEntity<?> crearAdministrador(@RequestBody Usuario usuario) {
        try {
            Usuario admin = usuarioService.crearUsuarioConRol(usuario, "ADMINISTRADOR");
            return ResponseEntity.ok(admin);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // NUEVO: Crear moderador
    @PostMapping("/crear-moderador")
    public ResponseEntity<?> crearModerador(@RequestBody Usuario usuario) {
        try {
            Usuario moderador = usuarioService.crearUsuarioConRol(usuario, "MODERADOR");
            return ResponseEntity.ok(moderador);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Reenviar email de verificacion
    @PostMapping("/reenviar-verificacion")
    public ResponseEntity<?> reenviarVerificacion(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            usuarioService.reenviarEmailVerificacion(email);
            return ResponseEntity.ok("Email de verificación reenviado correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Solicitar recuperación de contraseña
    @PostMapping("/recuperar-password")
    public ResponseEntity<?> recuperarPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            usuarioService.solicitarRecuperacionPassword(email);
            return ResponseEntity.ok("Código enviado a tu email");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Verificar código de recuperación
    @PostMapping("/verificar-codigo")
    public ResponseEntity<?> verificarCodigo(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String codigo = request.get("codigo");
            boolean valido = usuarioService.verificarCodigoRecuperacion(email, codigo);

            if (valido) {
                return ResponseEntity.ok("Código válido");
            } else {
                return ResponseEntity.badRequest().body("Código inválido o expirado");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al verificar código");
        }
    }

    // Restablecer contraseña
    @PostMapping("/restablecer-password")
    public ResponseEntity<?> restablecerPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String codigo = request.get("codigo");
            String nuevaPassword = request.get("nuevaPassword");

            usuarioService.restablecerPassword(email, codigo, nuevaPassword);
            return ResponseEntity.ok("Contraseña actualizada correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // NUEVO: Endpoint para eliminar todos los usuarios (DEBUG)
    @DeleteMapping("/debug/eliminar-usuarios")
    public ResponseEntity<?> eliminarTodosLosUsuarios() {
        try {
            usuarioService.eliminarTodosLosUsuarios();
            return ResponseEntity.ok("Todos los usuarios han sido eliminados correctamente.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar usuarios: " + e.getMessage());
        }
    }

    // CLASE AUXILIAR PARA LOGIN
    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}