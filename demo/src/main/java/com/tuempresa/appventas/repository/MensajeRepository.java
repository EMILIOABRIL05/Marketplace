package com.tuempresa.appventas.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tuempresa.appventas.model.Mensaje;

@Repository
public interface MensajeRepository extends JpaRepository<Mensaje, Long> {

    // Buscar mensajes por conversación ID
    List<Mensaje> findByConversacionIdOrderByFechaEnvioAsc(String conversacionId);

    // Buscar mensajes entre dos usuarios
    @Query("SELECT m FROM Mensaje m WHERE (m.remitente.id = :usuario1 AND m.destinatario.id = :usuario2) OR (m.remitente.id = :usuario2 AND m.destinatario.id = :usuario1) ORDER BY m.fechaEnvio ASC")
    List<Mensaje> findMensajesEntreUsuarios(@Param("usuario1") Long usuario1, @Param("usuario2") Long usuario2);

    // Buscar conversaciones de un usuario (últimos mensajes de cada conversación)
    @Query("SELECT m FROM Mensaje m WHERE m.id IN (SELECT MAX(m2.id) FROM Mensaje m2 WHERE m2.remitente.id = :usuarioId OR m2.destinatario.id = :usuarioId GROUP BY m2.conversacionId) ORDER BY m.fechaEnvio DESC")
    List<Mensaje> findConversacionesUsuario(@Param("usuarioId") Long usuarioId);

    // Contar mensajes no leídos de un usuario
    @Query("SELECT COUNT(m) FROM Mensaje m WHERE m.destinatario.id = :usuarioId AND m.leido = false")
    Long countMensajesNoLeidos(@Param("usuarioId") Long usuarioId);

    // Buscar mensajes no leídos de un usuario
    List<Mensaje> findByDestinatarioIdAndLeidoFalse(Long destinatarioId);

    // Buscar mensajes relacionados con un producto
    List<Mensaje> findByProductoIdOrderByFechaEnvioDesc(Long productoId);
    
    // Eliminar mensajes relacionados con un producto
    void deleteByProductoId(Long productoId);

    // Buscar mensajes relacionados con un servicio
    List<Mensaje> findByServicioIdOrderByFechaEnvioDesc(Long servicioId);
    
    // Eliminar mensajes relacionados con un servicio
    void deleteByServicioId(Long servicioId);
}
