package com.tuempresa.appventas.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.tuempresa.appventas.model.Carrito;
import com.tuempresa.appventas.model.DetallePedido;
import com.tuempresa.appventas.model.ItemCarrito;
import com.tuempresa.appventas.model.Pedido;
import com.tuempresa.appventas.model.Producto;
import com.tuempresa.appventas.model.Usuario;
import com.tuempresa.appventas.repository.CarritoRepository;
import com.tuempresa.appventas.repository.DetallePedidoRepository;
import com.tuempresa.appventas.repository.PedidoRepository;
import com.tuempresa.appventas.repository.ProductoRepository;
import com.tuempresa.appventas.repository.UsuarioRepository;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private DetallePedidoRepository detallePedidoRepository;

    @Autowired
    private CarritoRepository carritoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProductoRepository productoRepository;

    private final String UPLOAD_DIR = "uploads/comprobantes/";

    public Pedido crearPedidoDesdeCarrito(Long usuarioId, String metodoPago) {
        Usuario usuario = usuarioRepository.findById(usuarioId).orElseThrow();
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId).orElse(null);

        if (carrito == null || carrito.getItems().isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        Pedido pedido = new Pedido(usuario, carrito.getTotal());
        pedido.setMetodoPago(metodoPago);

        // Lógica de estado según método de pago
        if ("TARJETA".equalsIgnoreCase(metodoPago)) {
            pedido.setEstado("PAGADO"); // Simulación: Pago aprobado automáticamente
        } else {
            pedido.setEstado("PENDIENTE"); // Transferencia: Requiere comprobante
        }

        pedido = pedidoRepository.save(pedido);

        List<DetallePedido> detalles = new ArrayList<>();
        for (ItemCarrito item : carrito.getItems()) {
            DetallePedido detalle = new DetallePedido(pedido, item.getProducto(), item.getCantidad(), item.getProducto().getPrecio());
            detalles.add(detalle);
            
            // Reducir stock
            Producto p = item.getProducto();
            p.setCantidad(p.getCantidad() - item.getCantidad());
            productoRepository.save(p);
        }
        detallePedidoRepository.saveAll(detalles);

        // Vaciar carrito
        carrito.getItems().clear();
        carritoRepository.save(carrito);

        return pedido;
    }

    public Pedido subirComprobante(Long pedidoId, MultipartFile archivo) throws IOException {
        Pedido pedido = pedidoRepository.findById(pedidoId).orElseThrow();
        
        if (archivo != null && !archivo.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + archivo.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, archivo.getBytes());
            pedido.setComprobanteUrl("/uploads/comprobantes/" + fileName);
            pedido.setEstado("PAGADO_VERIFICANDO"); // Estado intermedio
            return pedidoRepository.save(pedido);
        }
        return pedido;
    }

    public Pedido confirmarPago(Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId).orElseThrow();
        pedido.setEstado("PAGADO");
        return pedidoRepository.save(pedido);
    }

    public List<Pedido> obtenerMisCompras(Long usuarioId) {
        return pedidoRepository.findByCompradorId(usuarioId);
    }

    public List<DetallePedido> obtenerMisVentas(Long vendedorId) {
        return detallePedidoRepository.findByProductoVendedorId(vendedorId);
    }
}
