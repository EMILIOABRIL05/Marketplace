package com.tuempresa.appventas.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tuempresa.appventas.model.Pedido;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByCompradorId(Long compradorId);
    // Para ver ventas (pedidos que contienen mis productos) - Esto es más complejo, lo haremos en servicio
}
