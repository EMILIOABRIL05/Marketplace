package com.tuempresa.appventas.repository;

import com.tuempresa.appventas.model.Incidencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface IncidenciaRepository extends JpaRepository<Incidencia, Long> {

    // Buscar incidencias por estado
    List<Incidencia> findByEstado(String estado);

    // Buscar incidencias por tipo
    List<Incidencia> findByTipo(String tipo);

    // Buscar incidencias por moderador encargado
    List<Incidencia> findByModeradorEncargadoId(Long moderadorId);

    // Buscar incidencias por vendedor
    List<Incidencia> findByVendedorId(Long vendedorId);

    // Buscar incidencias por producto
    List<Incidencia> findByProductoId(Long productoId);

    // Buscar incidencias por servicio
    List<Incidencia> findByServicioId(Long servicioId);

    // Buscar incidencias pendientes
    @Query("SELECT i FROM Incidencia i WHERE i.estado = 'PENDIENTE' ORDER BY i.fechaIncidencia DESC")
    List<Incidencia> findIncidenciasPendientes();

    // Buscar incidencias por rango de fechas
    @Query("SELECT i FROM Incidencia i WHERE i.fechaIncidencia BETWEEN :fechaInicio AND :fechaFin ORDER BY i.fechaIncidencia DESC")
    List<Incidencia> findByFechaIncidenciaBetween(@Param("fechaInicio") Date fechaInicio, @Param("fechaFin") Date fechaFin);

    // Buscar incidencias sin asignar (sin moderador)
    @Query("SELECT i FROM Incidencia i WHERE i.moderadorEncargado IS NULL AND i.estado = 'PENDIENTE' ORDER BY i.fechaIncidencia ASC")
    List<Incidencia> findIncidenciasSinAsignar();

    // Contar incidencias por estado
    Long countByEstado(String estado);

    // Verificar si un producto tiene incidencias activas
    @Query("SELECT COUNT(i) > 0 FROM Incidencia i WHERE i.producto.id = :productoId AND i.estado IN ('PENDIENTE', 'EN_REVISION')")
    boolean productoTieneIncidenciasActivas(@Param("productoId") Long productoId);

    // Verificar si un servicio tiene incidencias activas
    @Query("SELECT COUNT(i) > 0 FROM Incidencia i WHERE i.servicio.id = :servicioId AND i.estado IN ('PENDIENTE', 'EN_REVISION')")
    boolean servicioTieneIncidenciasActivas(@Param("servicioId") Long servicioId);
}
