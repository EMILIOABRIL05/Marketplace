package com.tuempresa.appventas.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tuempresa.appventas.model.Mensaje;
import com.tuempresa.appventas.model.Producto;
import com.tuempresa.appventas.model.Servicio;
import com.tuempresa.appventas.model.Usuario;
import com.tuempresa.appventas.repository.MensajeRepository;

@Service
public class MensajeService {

    @Autowired
    private MensajeRepository mensajeRepository;

    @Autowired
    private EmailService emailService;

    // Enviar mensaje simple
    @Transactional
    public Mensaje enviarMensaje(Usuario remitente, Usuario destinatario, String contenido) {
        Mensaje mensaje = new Mensaje(remitente, destinatario, contenido);
        Mensaje guardado = mensajeRepository.save(mensaje);
        
        // Enviar notificación por correo
        emailService.enviarNotificacionMensaje(
            destinatario.getEmail(), 
            destinatario.getNombre(), 
            remitente.getNombre() + " " + remitente.getApellido(), 
            contenido
        );
        
        return guardado;
    }

    // Enviar mensaje relacionado con un producto
    @Transactional
    public Mensaje enviarMensajeProducto(Usuario remitente, Usuario destinatario, String contenido, Producto producto) {
        Mensaje mensaje = new Mensaje(remitente, destinatario, contenido, producto);
        Mensaje guardado = mensajeRepository.save(mensaje);
        
        // Enviar notificación por correo
        emailService.enviarNotificacionMensaje(
            destinatario.getEmail(), 
            destinatario.getNombre(), 
            remitente.getNombre() + " " + remitente.getApellido(), 
            "Sobre producto " + producto.getNombre() + ": " + contenido
        );
        
        return guardado;
    }

    // Enviar mensaje relacionado con un servicio
    @Transactional
    public Mensaje enviarMensajeServicio(Usuario remitente, Usuario destinatario, String contenido, Servicio servicio) {
        Mensaje mensaje = new Mensaje(remitente, destinatario, contenido, servicio);
        Mensaje guardado = mensajeRepository.save(mensaje);
        
        // Enviar notificación por correo
        emailService.enviarNotificacionMensaje(
            destinatario.getEmail(), 
            destinatario.getNombre(), 
            remitente.getNombre() + " " + remitente.getApellido(), 
            "Sobre servicio " + servicio.getTitulo() + ": " + contenido
        );
        
        return guardado;
    }

    // Marcar mensaje como leído
    @Transactional
    public Mensaje marcarComoLeido(Long mensajeId) {
        Mensaje mensaje = mensajeRepository.findById(mensajeId)
                .orElseThrow(() -> new RuntimeException("Mensaje no encontrado"));

        mensaje.setLeido(true);
        mensaje.setFechaLeido(new Date());

        return mensajeRepository.save(mensaje);
    }

    // Marcar todos los mensajes de una conversación como leídos
    @Transactional
    public void marcarConversacionComoLeida(String conversacionId, Long usuarioId) {
        List<Mensaje> mensajes = mensajeRepository.findByConversacionIdOrderByFechaEnvioAsc(conversacionId);

        for (Mensaje mensaje : mensajes) {
            if (mensaje.getDestinatario().getId().equals(usuarioId) && !mensaje.getLeido()) {
                mensaje.setLeido(true);
                mensaje.setFechaLeido(new Date());
                mensajeRepository.save(mensaje);
            }
        }
    }

    // Obtener mensajes entre dos usuarios
    public List<Mensaje> obtenerMensajesEntreUsuarios(Long usuario1Id, Long usuario2Id) {
        return mensajeRepository.findMensajesEntreUsuarios(usuario1Id, usuario2Id);
    }

    // Obtener conversaciones de un usuario
    public List<Mensaje> obtenerConversacionesUsuario(Long usuarioId) {
        return mensajeRepository.findConversacionesUsuario(usuarioId);
    }

    // Contar mensajes no leídos
    public Long contarMensajesNoLeidos(Long usuarioId) {
        return mensajeRepository.countMensajesNoLeidos(usuarioId);
    }

    // Obtener mensajes no leídos
    public List<Mensaje> obtenerMensajesNoLeidos(Long usuarioId) {
        return mensajeRepository.findByDestinatarioIdAndLeidoFalse(usuarioId);
    }

    // Obtener mensajes por conversación ID
    public List<Mensaje> obtenerMensajesPorConversacion(String conversacionId) {
        return mensajeRepository.findByConversacionIdOrderByFechaEnvioAsc(conversacionId);
    }

    // Generar ID de conversación entre dos usuarios
    public String generarConversacionId(Long usuario1Id, Long usuario2Id) {
        Long menor = Math.min(usuario1Id, usuario2Id);
        Long mayor = Math.max(usuario1Id, usuario2Id);
        return menor + "_" + mayor;
    }

    // Obtener mensaje por ID
    public Mensaje obtenerMensajePorId(Long id) {
        return mensajeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mensaje no encontrado"));
    }
}
