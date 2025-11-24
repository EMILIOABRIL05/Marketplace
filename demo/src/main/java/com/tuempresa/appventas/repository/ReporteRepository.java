package com.tuempresa.appventas.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.tuempresa.appventas.model.Reporte;
import java.util.List;

@Repository
public interface ReporteRepository extends JpaRepository<Reporte, Long> {

    // Buscar por estado
    List<Reporte> findByEstado(String estado);

    // Buscar reportes de productos
    List<Reporte> findByProductoId(Long productoId);

    // 🆕 NUEVO: Buscar reportes de servicios
    List<Reporte> findByServicioId(Long servicioId);

    // Buscar reportes por usuario
    List<Reporte> findByUsuarioId(Long usuarioId);

    // Eliminar reportes de productos
    @Transactional
    void deleteByProductoId(Long productoId);

    // 🆕 NUEVO: Eliminar reportes de servicios
    @Transactional
    void deleteByServicioId(Long servicioId);
}