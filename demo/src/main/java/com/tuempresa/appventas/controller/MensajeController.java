package com.tuempresa.appventas.controller;

import com.tuempresa.appventas.model.Mensaje;
import com.tuempresa.appventas.model.Producto;
import com.tuempresa.appventas.model.Servicio;
import com.tuempresa.appventas.model.Usuario;
import com.tuempresa.appventas.service.MensajeService;
import com.tuempresa.appventas.service.ProductoService;
import com.tuempresa.appventas.service.ServicioService;
import com.tuempresa.appventas.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mensajes")
@CrossOrigin(origins = "*")
public class MensajeController {

    @Autowired
    private MensajeService mensajeService;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private ProductoService productoService;

    @Autowired
    private ServicioService servicioService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Enviar mensaje simple
    @PostMapping("/enviar")
    public ResponseEntity<?> enviarMensaje(@RequestBody Map<String, Object> request) {
        try {
            Long remitenteId = Long.parseLong(request.get("remitenteId").toString());
            Long destinatarioId = Long.parseLong(request.get("destinatarioId").toString());
            String contenido = request.get("contenido").toString();

            Usuario remitente = usuarioService.obtenerPorId(remitenteId)
                    .orElseThrow(() -> new RuntimeException("Remitente no encontrado"));
            Usuario destinatario = usuarioService.obtenerPorId(destinatarioId)
                    .orElseThrow(() -> new RuntimeException("Destinatario no encontrado"));

            Mensaje mensaje;

            // Verificar si es sobre un producto o servicio
            if (request.containsKey("productoId") && request.get("productoId") != null) {
                Long productoId = Long.parseLong(request.get("productoId").toString());
                Producto producto = productoService.obtenerPorId(productoId);
                mensaje = mensajeService.enviarMensajeProducto(remitente, destinatario, contenido, producto);
            } else if (request.containsKey("servicioId") && request.get("servicioId") != null) {
                Long servicioId = Long.parseLong(request.get("servicioId").toString());
                Servicio servicio = servicioService.obtenerServicioPorId(servicioId)
                        .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
                mensaje = mensajeService.enviarMensajeServicio(remitente, destinatario, contenido, servicio);
            } else {
                mensaje = mensajeService.enviarMensaje(remitente, destinatario, contenido);
            }

            // Enviar notificación WebSocket al destinatario
            messagingTemplate.convertAndSend(
                "/topic/mensajes/" + destinatarioId,
                mensaje
            );

            return ResponseEntity.ok(mensaje);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Marcar mensaje como leído
    @PutMapping("/{id}/leer")
    public ResponseEntity<?> marcarComoLeido(@PathVariable Long id) {
        try {
            Mensaje mensaje = mensajeService.marcarComoLeido(id);
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Marcar conversación como leída
    @PutMapping("/conversacion/{conversacionId}/leer")
    public ResponseEntity<?> marcarConversacionComoLeida(
            @PathVariable String conversacionId,
            @RequestParam Long usuarioId) {
        try {
            mensajeService.marcarConversacionComoLeida(conversacionId, usuarioId);
            return ResponseEntity.ok(Map.of("mensaje", "Conversación marcada como leída"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Obtener mensajes entre dos usuarios
    @GetMapping("/conversacion")
    public ResponseEntity<?> obtenerMensajesEntreUsuarios(
            @RequestParam Long usuario1Id,
            @RequestParam Long usuario2Id) {
        try {
            List<Mensaje> mensajes = mensajeService.obtenerMensajesEntreUsuarios(usuario1Id, usuario2Id);
            return ResponseEntity.ok(mensajes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Obtener todas las conversaciones de un usuario
    @GetMapping("/conversaciones/{usuarioId}")
    public ResponseEntity<?> obtenerConversacionesUsuario(@PathVariable Long usuarioId) {
        try {
            List<Mensaje> conversaciones = mensajeService.obtenerConversacionesUsuario(usuarioId);
            return ResponseEntity.ok(conversaciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Contar mensajes no leídos
    @GetMapping("/no-leidos/count/{usuarioId}")
    public ResponseEntity<?> contarMensajesNoLeidos(@PathVariable Long usuarioId) {
        try {
            Long count = mensajeService.contarMensajesNoLeidos(usuarioId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Obtener mensajes no leídos
    @GetMapping("/no-leidos/{usuarioId}")
    public ResponseEntity<?> obtenerMensajesNoLeidos(@PathVariable Long usuarioId) {
        try {
            List<Mensaje> mensajes = mensajeService.obtenerMensajesNoLeidos(usuarioId);
            return ResponseEntity.ok(mensajes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Obtener mensajes por conversación ID
    @GetMapping("/conversacion/{conversacionId}")
    public ResponseEntity<?> obtenerMensajesPorConversacion(@PathVariable String conversacionId) {
        try {
            List<Mensaje> mensajes = mensajeService.obtenerMensajesPorConversacion(conversacionId);
            return ResponseEntity.ok(mensajes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
