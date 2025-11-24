package com.tuempresa.appventas.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tuempresa.appventas.model.ItemCarrito;

import jakarta.transaction.Transactional;

public interface ItemCarritoRepository extends JpaRepository<ItemCarrito, Long> {
    @Transactional
    void deleteByProductoId(Long productoId);
}
