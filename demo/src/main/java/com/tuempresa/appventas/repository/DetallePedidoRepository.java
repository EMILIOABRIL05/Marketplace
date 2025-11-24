package com.tuempresa.appventas.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tuempresa.appventas.model.DetallePedido;

public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Long> {
    List<DetallePedido> findByProductoVendedorId(Long vendedorId);
}
