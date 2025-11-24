package com.tuempresa.appventas.repository;

import com.tuempresa.appventas.model.ItemCarrito;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemCarritoRepository extends JpaRepository<ItemCarrito, Long> {
    @Transactional
    void deleteByProductoId(Long productoId);
}
