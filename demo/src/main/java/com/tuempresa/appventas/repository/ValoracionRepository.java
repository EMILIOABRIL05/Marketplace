package com.tuempresa.appventas.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tuempresa.appventas.model.Valoracion;

public interface ValoracionRepository extends JpaRepository<Valoracion, Long> {

    List<Valoracion> findByVendedorIdOrderByFechaCreacionDesc(Long vendedorId);

    boolean existsByVendedorIdAndCompradorId(Long vendedorId, Long compradorId);

    @Query("SELECT AVG(v.calificacion) FROM Valoracion v WHERE v.vendedor.id = :vendedorId")
    Double obtenerPromedioPorVendedor(@Param("vendedorId") Long vendedorId);

    @Query("SELECT COUNT(v) FROM Valoracion v WHERE v.vendedor.id = :vendedorId")
    Long contarPorVendedor(@Param("vendedorId") Long vendedorId);
}
