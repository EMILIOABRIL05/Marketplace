package com.tuempresa.appventas.controller;

import com.tuempresa.appventas.model.Producto;
import com.tuempresa.appventas.model.Usuario;
import com.tuempresa.appventas.repository.ProductoRepository;
import com.tuempresa.appventas.service.ProductoService;
import com.tuempresa.appventas.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    private final ProductoService productoService;
    private final UsuarioService usuarioService;
    private final ProductoRepository productoRepository;

    public ProductoController(ProductoService productoService, UsuarioService usuarioService, ProductoRepository productoRepository) {
        this.productoService = productoService;
        this.usuarioService = usuarioService;
        this.productoRepository = productoRepository;
    }

    // Listar productos
    @GetMapping
    public ResponseEntity<List<Producto>> listar(@RequestParam(required = false) String estado) {
        return ResponseEntity.ok(productoService.obtenerProductosActivos());
    }

    // Obtener producto por id
    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtener(@PathVariable Long id) {
        Producto p = productoService.obtenerPorId(id);
        return ResponseEntity.ok(p);
    }

    // 🆕 CREAR PRODUCTO CON IMÁGENES - CORREGIDO
    @PostMapping
    public ResponseEntity<?> crear(
            @RequestParam("nombre") String nombre,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("precio") Double precio,
            @RequestParam("categoria") String categoria,
            @RequestParam("ubicacion") String ubicacion,
            @RequestParam("vendedorId") Long vendedorId,
            @RequestParam(value = "cantidad", defaultValue = "1") Integer cantidad,
            @RequestParam(value = "estadoProducto", required = false) String estadoProducto,
            @RequestParam(value = "imagenes", required = false) List<MultipartFile> imagenes
    ) {
        try {
            // ✅ LOGS PARA DEBUG
            System.out.println("📦 Creando producto:");
            System.out.println("Nombre: " + nombre);
            System.out.println("Precio: " + precio);
            System.out.println("Cantidad: " + cantidad);
            System.out.println("Estado Producto: " + estadoProducto);
            System.out.println("Vendedor ID: " + vendedorId);
            System.out.println("Imágenes: " + (imagenes != null ? imagenes.size() : 0));

            // Validar que haya al menos 1 imagen
            if (imagenes == null || imagenes.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Debes subir al menos 1 imagen"));
            }

            // Validar que no supere 5 imágenes
            if (imagenes.size() > 5) {
                return ResponseEntity.badRequest().body(Map.of("message", "Máximo 5 imágenes permitidas"));
            }

            // Validar cantidad
            if (cantidad == null || cantidad < 1) {
                cantidad = 1;
            }

            // BUSCAR USUARIO
            Usuario vendedor = usuarioService.obtenerPorId(vendedorId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + vendedorId));

            // Verificar que la cuenta esté verificada
            if (!vendedor.isCuentaVerificada()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Debes verificar tu cuenta antes de publicar productos"));
            }

            // Verificar que la cuenta esté activa
            if (!"ACTIVO".equals(vendedor.getEstado())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Tu cuenta no está activa"));
            }

            // Crear producto
            Producto producto = new Producto();
            producto.setNombre(nombre);
            producto.setDescripcion(descripcion);
            producto.setPrecio(precio);
            producto.setTipo(categoria);
            producto.setUbicacion(ubicacion);
            producto.setVendedor(vendedor);
            producto.setEstado("ACTIVO");
            producto.setDisponibilidad(true);
            producto.setFechaPublicacion(new Date());
            producto.setCodigo("PROD-" + System.currentTimeMillis());
            producto.setCantidad(cantidad);
            producto.setEstadoProducto(estadoProducto != null ? estadoProducto : "Nuevo");

            // Guardar todas las imágenes
            List<String> imagenesUrls = new ArrayList<>();
            for (MultipartFile imagen : imagenes) {
                if (!imagen.isEmpty()) {
                    String imagenUrl = guardarImagen(imagen);
                    imagenesUrls.add(imagenUrl);
                }
            }

            // Asignar URLs a los campos del producto
            if (imagenesUrls.size() > 0) producto.setImagenUrl1(imagenesUrls.get(0));
            if (imagenesUrls.size() > 1) producto.setImagenUrl2(imagenesUrls.get(1));
            if (imagenesUrls.size() > 2) producto.setImagenUrl3(imagenesUrls.get(2));
            if (imagenesUrls.size() > 3) producto.setImagenUrl4(imagenesUrls.get(3));
            if (imagenesUrls.size() > 4) producto.setImagenUrl5(imagenesUrls.get(4));

            // Guardar en BD
            Producto productoGuardado = productoService.crearProducto(producto, vendedor);
            return ResponseEntity.ok(productoGuardado);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Error al crear producto: " + e.getMessage()));
        }
    }

    // ✅ ACTUALIZAR PRODUCTO - CORREGIDO
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Long id,
            @RequestParam(value = "nombre", required = false) String nombre,
            @RequestParam(value = "descripcion", required = false) String descripcion,
            @RequestParam(value = "precio", required = false) Double precio,
            @RequestParam(value = "categoria", required = false) String categoria,
            @RequestParam(value = "ubicacion", required = false) String ubicacion,
            @RequestParam(value = "disponibilidad", required = false) Boolean disponibilidad,
            @RequestParam(value = "estado", required = false) String estado,
            @RequestParam(value = "cantidad", required = false) Integer cantidad,
            @RequestParam(value = "estadoProducto", required = false) String estadoProducto,
            @RequestParam(value = "imagenes", required = false) List<MultipartFile> imagenes) {

        try {
            Producto productoExistente = productoService.obtenerPorId(id);

            // Actualizar solo los campos que vienen en la request
            if (nombre != null) productoExistente.setNombre(nombre);
            if (descripcion != null) productoExistente.setDescripcion(descripcion);
            if (precio != null) productoExistente.setPrecio(precio);
            if (categoria != null) productoExistente.setTipo(categoria);
            if (ubicacion != null) productoExistente.setUbicacion(ubicacion);
            if (disponibilidad != null) productoExistente.setDisponibilidad(disponibilidad);
            if (estado != null) productoExistente.setEstado(estado);
            if (cantidad != null && cantidad >= 0) productoExistente.setCantidad(cantidad);
            if (estadoProducto != null) productoExistente.setEstadoProducto(estadoProducto);

            // Manejar imágenes si se envían
            if (imagenes != null && !imagenes.isEmpty()) {
                if (imagenes.size() > 5) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Máximo 5 imágenes permitidas"));
                }

                List<String> imagenesUrls = new ArrayList<>();
                for (MultipartFile imagen : imagenes) {
                    if (!imagen.isEmpty()) {
                        String imagenUrl = guardarImagen(imagen);
                        imagenesUrls.add(imagenUrl);
                    }
                }

                // Actualizar URLs de imágenes
                if (imagenesUrls.size() > 0) productoExistente.setImagenUrl1(imagenesUrls.get(0));
                if (imagenesUrls.size() > 1) productoExistente.setImagenUrl2(imagenesUrls.get(1));
                if (imagenesUrls.size() > 2) productoExistente.setImagenUrl3(imagenesUrls.get(2));
                if (imagenesUrls.size() > 3) productoExistente.setImagenUrl4(imagenesUrls.get(3));
                if (imagenesUrls.size() > 4) productoExistente.setImagenUrl5(imagenesUrls.get(4));
            }

            Producto actualizado = productoService.actualizarProducto(id, productoExistente);
            return ResponseEntity.ok(actualizado);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Error al actualizar producto: " + e.getMessage()));
        }
    }

    // MÉTODO PARA GUARDAR IMÁGENES
    private String guardarImagen(MultipartFile imagen) throws IOException {
        String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "productos" + File.separator;
        File directory = new File(uploadDir);

        if (!directory.exists()) {
            boolean created = directory.mkdirs();
            if (!created) {
                throw new IOException("No se pudo crear el directorio: " + uploadDir);
            }
        }

        String extension = "";
        String originalFilename = imagen.getOriginalFilename();
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String fileName = System.currentTimeMillis() + "_" + UUID.randomUUID().toString() + extension;
        String filePath = uploadDir + fileName;

        File file = new File(filePath);
        imagen.transferTo(file);

        System.out.println("✅ Imagen guardada en: " + filePath);

        return "/uploads/productos/" + fileName;
    }

    // CAMBIAR ESTADO DEL PRODUCTO (ACTIVO/OCULTO)
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestParam String nuevoEstado) {
        try {
            Producto producto = productoService.obtenerPorId(id);
            producto.setEstado(nuevoEstado);
            Producto actualizado = productoService.actualizarProducto(id, producto);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Cambiar estado (ej. OCULTO)
    @PostMapping("/{id}/ocultar")
    public ResponseEntity<?> ocultar(@PathVariable Long id) {
        try {
            Producto oculto = productoService.eliminarProducto(id);
            return ResponseEntity.ok(oculto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE definitivo (físico)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarDefinitivo(@PathVariable Long id) {
        try {
            productoService.eliminarProductoDefinitivo(id);
            return ResponseEntity.ok(Map.of("message", "Producto eliminado definitivamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(Map.of("error", "No se pudo eliminar producto", "details", e.getMessage()));
        }
    }

    // Obtener productos por vendedor
    @GetMapping("/vendedor/{vendedorId}")
    public ResponseEntity<List<Producto>> porVendedor(@PathVariable Long vendedorId) {
        return ResponseEntity.ok(productoService.obtenerProductosPorVendedor(vendedorId));
    }

    // Búsqueda por nombre
    @GetMapping("/buscar")
    public ResponseEntity<List<Producto>> buscar(@RequestParam String nombre) {
        return ResponseEntity.ok(productoService.buscarPorNombre(nombre));
    }

    // 🆕 ENDPOINT PÚBLICO PARA EL CATÁLOGO
    @GetMapping("/public")
    public ResponseEntity<List<Producto>> getProductosPublicos() {
        try {
            List<Producto> productos = productoRepository.findByEstado("ACTIVO");
            return ResponseEntity.ok(productos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // 🆕 ENDPOINT PÚBLICO PARA PRODUCTO INDIVIDUAL
    @GetMapping("/public/{id}")
    public ResponseEntity<Producto> getProductoPublico(@PathVariable Long id) {
        try {
            Optional<Producto> producto = productoRepository.findById(id);
            if (producto.isPresent() && "ACTIVO".equals(producto.get().getEstado())) {
                return ResponseEntity.ok(producto.get());
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}