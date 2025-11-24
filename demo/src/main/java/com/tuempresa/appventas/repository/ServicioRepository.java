package com.tuempresa.appventas.repository;

import com.tuempresa.appventas.model.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServicioRepository extends JpaRepository<Servicio, Long> {

    List<Servicio> findByActivoTrue();

    // Para el catálogo público: solo servicios activos y visibles
    List<Servicio> findByActivoTrueAndEstado(String estado);

    List<Servicio> findByVendedorIdAndActivoTrue(Long vendedorId);

    List<Servicio> findByCategoriaAndActivoTrue(String categoria);

    // Para el catálogo público: servicios por categoría y visibles
    List<Servicio> findByCategoriaAndActivoTrueAndEstado(String categoria, String estado);

    Optional<Servicio> findByIdAndActivoTrue(Long id);

    List<Servicio> findByActivoTrueOrderByFechaCreacionDesc();

    List<Servicio> findByCiudadAndActivoTrue(String ciudad);

    // Para el catálogo público: servicios por ciudad y visibles
    List<Servicio> findByCiudadAndActivoTrueAndEstado(String ciudad, String estado);

    List<Servicio> findByModalidadAndActivoTrue(String modalidad);

    // Para el catálogo público: servicios por modalidad y visibles
    List<Servicio> findByModalidadAndActivoTrueAndEstado(String modalidad, String estado);

    // MÉTODOS NUEVOS PARA DASHBOARD - CORREGIDOS
    @Query("SELECT COUNT(s) FROM Servicio s WHERE s.activo = true")
    Long countServiciosActivos();

    @Query("SELECT COUNT(s) FROM Servicio s WHERE s.activo = true AND FUNCTION('MONTH', s.fechaCreacion) = FUNCTION('MONTH', CURRENT_DATE) AND FUNCTION('YEAR', s.fechaCreacion) = FUNCTION('YEAR', CURRENT_DATE)")
    Long countServiciosEsteMes();

    // MÉTODOS SIMPLIFICADOS - solo usando el campo 'activo'
    @Query("SELECT COUNT(s) FROM Servicio s WHERE s.activo = true")
    Long countServiciosPublicados();

    @Query("SELECT COUNT(s) FROM Servicio s WHERE s.activo = true AND FUNCTION('MONTH', s.fechaCreacion) = FUNCTION('MONTH', CURRENT_DATE) AND FUNCTION('YEAR', s.fechaCreacion) = FUNCTION('YEAR', CURRENT_DATE)")
    Long countServiciosPublicadosEsteMes();
}