package com.tuempresa.appventas.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.tuempresa.appventas.model.Favorito;
import java.util.List;
import java.util.Optional;

@Repository
public interface FavoritoRepository extends JpaRepository<Favorito, Long> {
    List<Favorito> findByUsuarioId(Long usuarioId);

    // Para productos
    Optional<Favorito> findByUsuarioIdAndProductoId(Long usuarioId, Long productoId);
    
    @Transactional
    void deleteByUsuarioIdAndProductoId(Long usuarioId, Long productoId);
    
    @Transactional
    void deleteByProductoId(Long productoId);

    // Para servicios
    Optional<Favorito> findByUsuarioIdAndServicioId(Long usuarioId, Long servicioId);
    
    @Transactional
    void deleteByUsuarioIdAndServicioId(Long usuarioId, Long servicioId);
    
    @Transactional
    void deleteByServicioId(Long servicioId);
}