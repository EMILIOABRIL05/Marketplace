package com.tuempresa.appventas.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tuempresa.appventas.model.Carrito;
import com.tuempresa.appventas.model.ItemCarrito;
import com.tuempresa.appventas.model.Producto;
import com.tuempresa.appventas.model.Usuario;
import com.tuempresa.appventas.repository.CarritoRepository;
import com.tuempresa.appventas.repository.ItemCarritoRepository;
import com.tuempresa.appventas.repository.ProductoRepository;
import com.tuempresa.appventas.repository.UsuarioRepository;

@Service
public class CarritoService {

    @Autowired
    private CarritoRepository carritoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProductoRepository productoRepository;
    
    @Autowired
    private ItemCarritoRepository itemCarritoRepository;

    public Carrito obtenerCarritoPorUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        return carritoRepository.findByUsuario(usuario)
                .orElseGet(() -> {
                    Carrito nuevoCarrito = new Carrito(usuario);
                    return carritoRepository.save(nuevoCarrito);
                });
    }

    @Transactional
    public Carrito agregarProducto(Long usuarioId, Long productoId, Integer cantidad) {
        Carrito carrito = obtenerCarritoPorUsuario(usuarioId);
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (producto.getCantidad() < cantidad) {
            throw new RuntimeException("Stock insuficiente");
        }

        Optional<ItemCarrito> itemExistente = carrito.getItems().stream()
                .filter(item -> item.getProducto().getId().equals(productoId))
                .findFirst();

        if (itemExistente.isPresent()) {
            ItemCarrito item = itemExistente.get();
            item.setCantidad(item.getCantidad() + cantidad);
        } else {
            ItemCarrito newItem = new ItemCarrito(producto, cantidad, carrito);
            carrito.getItems().add(newItem);
        }

        return carritoRepository.save(carrito);
    }

    @Transactional
    public Carrito eliminarProducto(Long usuarioId, Long productoId) {
        Carrito carrito = obtenerCarritoPorUsuario(usuarioId);
        carrito.getItems().removeIf(item -> item.getProducto().getId().equals(productoId));
        return carritoRepository.save(carrito);
    }
    
    @Transactional
    public Carrito actualizarCantidad(Long usuarioId, Long productoId, Integer cantidad) {
        Carrito carrito = obtenerCarritoPorUsuario(usuarioId);
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
                
        if (producto.getCantidad() < cantidad) {
            throw new RuntimeException("Stock insuficiente");
        }

        Optional<ItemCarrito> itemExistente = carrito.getItems().stream()
                .filter(item -> item.getProducto().getId().equals(productoId))
                .findFirst();

        if (itemExistente.isPresent()) {
            ItemCarrito item = itemExistente.get();
            if (cantidad <= 0) {
                carrito.getItems().remove(item);
            } else {
                item.setCantidad(cantidad);
            }
        }

        return carritoRepository.save(carrito);
    }

    @Transactional
    public void vaciarCarrito(Long usuarioId) {
        Carrito carrito = obtenerCarritoPorUsuario(usuarioId);
        carrito.getItems().clear();
        carritoRepository.save(carrito);
    }
}
