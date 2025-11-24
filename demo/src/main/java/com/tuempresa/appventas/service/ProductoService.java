package com.tuempresa.appventas.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tuempresa.appventas.model.Producto;
import com.tuempresa.appventas.model.Usuario;
import com.tuempresa.appventas.repository.DetallePedidoRepository;
import com.tuempresa.appventas.repository.FavoritoRepository;
import com.tuempresa.appventas.repository.HistorialRepository;
import com.tuempresa.appventas.repository.ItemCarritoRepository;
import com.tuempresa.appventas.repository.MensajeRepository;
import com.tuempresa.appventas.repository.ProductoRepository;
import com.tuempresa.appventas.repository.ReporteRepository;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private HistorialRepository historialRepository;

    @Autowired
    private ReporteRepository reporteRepository;

    @Autowired
    private FavoritoRepository favoritoRepository;

    @Autowired
    private ItemCarritoRepository itemCarritoRepository;

    @Autowired
    private DetallePedidoRepository detallePedidoRepository;

    @Autowired
    private MensajeRepository mensajeRepository;

    @Autowired
    private IncidenciaService incidenciaService;

    // CREAR PRODUCTO
    public Producto crearProducto(Producto producto, Usuario vendedor) {
        if (producto.getNombre() == null || producto.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre del producto es obligatorio");
        }

        if (producto.getPrecio() <= 0) {
            throw new RuntimeException("El precio debe ser mayor a 0");
        }

        producto.setVendedor(vendedor);
        producto.setEstado("ACTIVO");
        producto.setDisponibilidad(true);
        producto.setFechaPublicacion(new Date());
        producto.setCodigo("PROD-" + System.currentTimeMillis());

        // Guardar el producto primero
        Producto productoGuardado = productoRepository.save(producto);

        // Detectar contenido prohibido automáticamente
        try {
            incidenciaService.crearIncidenciaAutomatica(productoGuardado);
        } catch (Exception e) {
            System.err.println("Error al detectar contenido prohibido: " + e.getMessage());
        }

        return productoGuardado;
    }

    // OBTENER PRODUCTOS ACTIVOS
    public List<Producto> obtenerProductosActivos() {
        return productoRepository.findByEstado("ACTIVO");
    }

    // OBTENER PRODUCTOS POR VENDEDOR
    public List<Producto> obtenerProductosPorVendedor(Long vendedorId) {
        return productoRepository.findByVendedorId(vendedorId);
    }

    // OBTENER PRODUCTO POR ID
    public Producto obtenerPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    // ACTUALIZAR PRODUCTO
    public Producto actualizarProducto(Long id, Producto productoActualizado) {
        return productoRepository.findById(id)
                .map(producto -> {
                    producto.setNombre(productoActualizado.getNombre());
                    producto.setDescripcion(productoActualizado.getDescripcion());
                    producto.setPrecio(productoActualizado.getPrecio());
                    producto.setTipo(productoActualizado.getTipo());
                    producto.setUbicacion(productoActualizado.getUbicacion());
                    producto.setDisponibilidad(productoActualizado.getDisponibilidad());
                    producto.setImagenUrl1(productoActualizado.getImagenUrl1());
                    producto.setImagenUrl2(productoActualizado.getImagenUrl2());
                    producto.setImagenUrl3(productoActualizado.getImagenUrl3());
                    producto.setImagenUrl4(productoActualizado.getImagenUrl4());
                    producto.setImagenUrl5(productoActualizado.getImagenUrl5());
                    producto.setCantidad(productoActualizado.getCantidad());
                    producto.setEstadoProducto(productoActualizado.getEstadoProducto());
                    return productoRepository.save(producto);
                })
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    // CAMBIAR ESTADO DE PRODUCTO
    public Producto cambiarEstadoProducto(Long id, String nuevoEstado) {
        return productoRepository.findById(id)
                .map(producto -> {
                    producto.setEstado(nuevoEstado);
                    return productoRepository.save(producto);
                })
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    // ELIMINAR PRODUCTO (cambiar estado a OCULTO)
    public Producto eliminarProducto(Long id) {
        return cambiarEstadoProducto(id, "OCULTO");
    }

    //Eliminar producto definitivo (físicamente de la BD)
    @Transactional
    public void eliminarProductoDefinitivo(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        // 1. Borrar mensajes relacionados
        try {
            mensajeRepository.deleteByProductoId(id);
            System.out.println("✅ Mensajes eliminados para producto: " + id);
        } catch (Exception e) {
            System.err.println("⚠️ Error borrando mensajes: " + e.getMessage());
        }
        
        // 2. Borrar detalles de pedidos relacionados
        try {
            detallePedidoRepository.deleteByProductoId(id);
            System.out.println("✅ Detalles de pedidos eliminados para producto: " + id);
        } catch (Exception e) {
            System.err.println("⚠️ Error borrando detalles de pedidos: " + e.getMessage());
        }
        
        // 3. Borrar items del carrito relacionados
        try {
            itemCarritoRepository.deleteByProductoId(id);
            System.out.println("✅ Items del carrito eliminados para producto: " + id);
        } catch (Exception e) {
            System.err.println("⚠️ Error borrando items del carrito: " + e.getMessage());
        }
        
        // 4. Borrar favoritos relacionados
        try {
            favoritoRepository.deleteByProductoId(id);
            System.out.println("✅ Favoritos eliminados para producto: " + id);
        } catch (Exception e) {
            System.err.println("⚠️ Error borrando favoritos: " + e.getMessage());
        }
        
        // 5. Borrar reportes relacionados
        try {
            reporteRepository.deleteByProductoId(id);
            System.out.println("✅ Reportes eliminados para producto: " + id);
        } catch (Exception e) {
            System.err.println("⚠️ Error borrando reportes: " + e.getMessage());
        }
        
        // 6. Borrar historial relacionado
        try {
            historialRepository.deleteByProductoId(id);
            System.out.println("✅ Historial eliminado para producto: " + id);
        } catch (Exception e) {
            System.err.println("⚠️ Error borrando historial: " + e.getMessage());
        }
        
        // 7. Finalmente borrar el producto
        productoRepository.delete(producto);
        System.out.println("✅ Producto eliminado exitosamente: " + id);
    }

    // FILTRAR PRODUCTOS POR PRECIO
    public List<Producto> filtrarPorPrecio(Double precioMin, Double precioMax) {
        List<Producto> productosActivos = obtenerProductosActivos();
        return productosActivos.stream()
                .filter(p -> p.getPrecio() >= precioMin && p.getPrecio() <= precioMax)
                .toList();
    }

    // BUSCAR PRODUCTOS POR NOMBRE
    public List<Producto> buscarPorNombre(String nombre) {
        List<Producto> productosActivos = obtenerProductosActivos();
        return productosActivos.stream()
                .filter(p -> p.getNombre().toLowerCase().contains(nombre.toLowerCase()))
                .toList();
    }

    // OBTENER TODOS LOS PRODUCTOS (PARA ADMIN/MODERADOR)
    public List<Producto> obtenerTodosLosProductos() {
        return productoRepository.findAll();
    }
}