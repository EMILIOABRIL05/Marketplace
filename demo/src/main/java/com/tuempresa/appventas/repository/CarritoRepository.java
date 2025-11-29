package com.tuempresa.appventas.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tuempresa.appventas.model.Carrito;
import com.tuempresa.appventas.model.Usuario;

public interface CarritoRepository extends JpaRepository<Carrito, Long> {
    
    @Query("SELECT DISTINCT c FROM Carrito c " +
           "LEFT JOIN FETCH c.items i " +
           "LEFT JOIN FETCH i.producto p " +
           "LEFT JOIN FETCH p.vendedor v " +
           "WHERE c.usuario = :usuario")
    Optional<Carrito> findByUsuario(@Param("usuario") Usuario usuario);
    
    @Query("SELECT DISTINCT c FROM Carrito c " +
           "LEFT JOIN FETCH c.items i " +
           "LEFT JOIN FETCH i.producto p " +
           "LEFT JOIN FETCH p.vendedor v " +
           "WHERE c.usuario.id = :usuarioId")
    Optional<Carrito> findByUsuarioId(@Param("usuarioId") Long usuarioId);
}
