package com.tuempresa.appventas.repository;

import com.tuempresa.appventas.model.Historial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Repository
public interface HistorialRepository extends JpaRepository<Historial, Long> {

    @Transactional
    void deleteByProductoId(Long productoId);

    @Transactional
    void deleteByServicioId(Long servicioId);

    List<Historial> findByUsuarioIdOrderByFechaVistoDesc(Long usuarioId);

    // Métodos existentes
    Historial findByUsuarioIdAndProductoId(Long usuarioId, Long productoId);
    Historial findByUsuarioIdAndServicioId(Long usuarioId, Long servicioId);

    // NUEVOS MÉTODOS para verificar duplicados recientes
    @Query("SELECT h FROM Historial h WHERE h.usuario.id = :usuarioId AND h.producto.id = :productoId AND h.fechaVisto > :fechaLimite")
    Historial findByUsuarioIdAndProductoIdAndFechaVistoAfter(
            @Param("usuarioId") Long usuarioId,
            @Param("productoId") Long productoId,
            @Param("fechaLimite") Date fechaLimite);

    @Query("SELECT h FROM Historial h WHERE h.usuario.id = :usuarioId AND h.servicio.id = :servicioId AND h.fechaVisto > :fechaLimite")
    Historial findByUsuarioIdAndServicioIdAndFechaVistoAfter(
            @Param("usuarioId") Long usuarioId,
            @Param("servicioId") Long servicioId,
            @Param("fechaLimite") Date fechaLimite);

    // MÉTODOS PARA DASHBOARD - AHORA FUNCIONAN CORRECTAMENTE
    List<Historial> findTop5ByOrderByFechaVistoDesc();

    @Query("SELECT COUNT(h) FROM Historial h WHERE h.fechaVisto >= :fecha")
    Long countTransaccionesEstaSemana(@Param("fecha") LocalDateTime fecha);

    // AHORA SÍ FUNCIONAN porque el campo 'estado' existe
    @Query("SELECT COUNT(h) FROM Historial h WHERE h.estado = 'COMPLETADO'")
    Long countTransaccionesCompletadas();

    @Query("SELECT COUNT(h) FROM Historial h WHERE h.estado = 'COMPLETADO' AND FUNCTION('MONTH', h.fechaVisto) = FUNCTION('MONTH', CURRENT_DATE) AND FUNCTION('YEAR', h.fechaVisto) = FUNCTION('YEAR', CURRENT_DATE)")
    Long countTransaccionesCompletadasEsteMes();

    @Query("SELECT COUNT(h) FROM Historial h WHERE h.fechaVisto >= :fecha")
    Long countByFechaVistoAfter(@Param("fecha") LocalDateTime fecha);

    default Long countTransaccionesEstaSemana() {
        LocalDateTime fechaLimite = LocalDateTime.now().minusDays(7);
        return countTransaccionesEstaSemana(fechaLimite);
    }

    default Double calcularTasaExito() {
        Long total = count();
        Long completadas = countTransaccionesCompletadas();
        return total > 0 ? (completadas.doubleValue() / total.doubleValue()) * 100 : 0.0;
    }

    default Double calcularTasaExitoEsteMes() {
        LocalDateTime inicioMes = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        Long totalEsteMes = countByFechaVistoAfter(inicioMes);
        Long completadasEsteMes = countTransaccionesCompletadasEsteMes();
        return totalEsteMes > 0 ? (completadasEsteMes.doubleValue() / totalEsteMes.doubleValue()) * 100 : 0.0;
    }
}