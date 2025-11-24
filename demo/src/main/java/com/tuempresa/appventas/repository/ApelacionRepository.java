package com.tuempresa.appventas.repository;

import com.tuempresa.appventas.model.Apelacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApelacionRepository extends JpaRepository<Apelacion, Long> {

    // Buscar apelaciones por incidencia
    List<Apelacion> findByIncidenciaId(Long incidenciaId);

    // Buscar apelaciones por vendedor
    List<Apelacion> findByVendedorId(Long vendedorId);

    // Buscar apelaciones por estado
    List<Apelacion> findByEstado(String estado);

    // Buscar apelaciones pendientes
    @Query("SELECT a FROM Apelacion a WHERE a.estado = 'PENDIENTE' ORDER BY a.fechaApelacion ASC")
    List<Apelacion> findApelacionesPendientes();

    // Buscar apelaciones asignadas a un moderador
    List<Apelacion> findByModeradorRevisorId(Long moderadorId);

    // Contar apelaciones por estado
    Long countByEstado(String estado);
}
