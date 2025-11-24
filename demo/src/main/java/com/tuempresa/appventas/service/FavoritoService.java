package com.tuempresa.appventas.service;

import com.tuempresa.appventas.model.Favorito;
import com.tuempresa.appventas.model.Usuario;
import com.tuempresa.appventas.model.Producto;
import com.tuempresa.appventas.model.Servicio;
import com.tuempresa.appventas.repository.FavoritoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class FavoritoService {

    @Autowired
    private FavoritoRepository favoritoRepository;

    // Métodos para Productos
    public Favorito agregarFavoritoProducto(Usuario usuario, Producto producto) {
        var existente = favoritoRepository.findByUsuarioIdAndProductoId(usuario.getId(), producto.getId());
        if (existente.isPresent()) {
            throw new RuntimeException("El producto ya está en favoritos");
        }

        Favorito favorito = new Favorito(usuario, producto);
        return favoritoRepository.save(favorito);
    }

    @Transactional
    public void eliminarFavoritoProducto(Long usuarioId, Long productoId) {
        favoritoRepository.deleteByUsuarioIdAndProductoId(usuarioId, productoId);
    }

    public boolean esFavoritoProducto(Long usuarioId, Long productoId) {
        return favoritoRepository.findByUsuarioIdAndProductoId(usuarioId, productoId).isPresent();
    }

    // Métodos para Servicios
    public Favorito agregarFavoritoServicio(Usuario usuario, Servicio servicio) {
        var existente = favoritoRepository.findByUsuarioIdAndServicioId(usuario.getId(), servicio.getId());
        if (existente.isPresent()) {
            throw new RuntimeException("El servicio ya está en favoritos");
        }

        Favorito favorito = new Favorito(usuario, servicio);
        return favoritoRepository.save(favorito);
    }

    @Transactional
    public void eliminarFavoritoServicio(Long usuarioId, Long servicioId) {
        favoritoRepository.deleteByUsuarioIdAndServicioId(usuarioId, servicioId);
    }

    public boolean esFavoritoServicio(Long usuarioId, Long servicioId) {
        return favoritoRepository.findByUsuarioIdAndServicioId(usuarioId, servicioId).isPresent();
    }

    // Método general
    public List<Favorito> obtenerFavoritosUsuario(Long usuarioId) {
        return favoritoRepository.findByUsuarioId(usuarioId);
    }
}