package com.tuempresa.appventas.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tuempresa.appventas.model.Carrito;
import com.tuempresa.appventas.model.Usuario;

public interface CarritoRepository extends JpaRepository<Carrito, Long> {
    Optional<Carrito> findByUsuario(Usuario usuario);
    Optional<Carrito> findByUsuarioId(Long usuarioId);
}
