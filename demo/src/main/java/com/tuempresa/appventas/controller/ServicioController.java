package com.tuempresa.appventas.controller;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tuempresa.appventas.model.Servicio;
import com.tuempresa.appventas.model.Usuario;
import com.tuempresa.appventas.repository.ServicioRepository;
import com.tuempresa.appventas.repository.UsuarioRepository;
import com.tuempresa.appventas.service.ServicioService;

@RestController
@RequestMapping("/api/servicios")
@CrossOrigin(origins = "*")
public class ServicioController {

    @Autowired
    private ServicioService servicioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ServicioRepository servicioRepository;

    @GetMapping
    public ResponseEntity<?> obtenerTodosLosServicios() {
        try {
            List<Servicio> servicios = servicioService.obtenerTodosLosServicios();
            return ResponseEntity.ok(servicios);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al obtener servicios");
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerServicioPorId(@PathVariable Long id) {
        try {
            Optional<Servicio> servicio = servicioService.obtenerServicioPorId(id);

            if (servicio.isPresent()) {
                return ResponseEntity.ok(servicio.get());
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Servicio no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al obtener servicio");
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/vendedor/{vendedorId}")
    public ResponseEntity<?> obtenerServiciosPorVendedor(@PathVariable Long vendedorId) {
        try {
            List<Servicio> servicios = servicioService.obtenerServiciosPorVendedor(vendedorId);
            return ResponseEntity.ok(servicios);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al obtener servicios");
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<?> obtenerServiciosPorCategoria(@PathVariable String categoria) {
        try {
            List<Servicio> servicios = servicioService.obtenerServiciosPorCategoria(categoria);
            return ResponseEntity.ok(servicios);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al obtener servicios");
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // 🆕 CREAR SERVICIO - CORREGIDO
    @PostMapping
    public ResponseEntity<?> crearServicio(
            @RequestParam("titulo") String titulo,
            @RequestParam("categoria") String categoria,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("tipoPrecio") String tipoPrecio,
            @RequestParam(value = "precio", required = false, defaultValue = "0") BigDecimal precio,
            @RequestParam("modalidad") String modalidad,
            @RequestParam("ciudad") String ciudad,
            @RequestParam(value = "barrio", required = false) String barrio,
            @RequestParam("diasDisponibles") String diasDisponibles,
            @RequestParam(value = "horario", required = false) String horario,
            @RequestParam("duracion") String duracion,
            @RequestParam(value = "condiciones", required = false) String condiciones,
            @RequestParam("vendedorId") Long vendedorId,
            @RequestParam(value = "imagenes", required = false) List<MultipartFile> imagenes) {

        try {
            // ✅ LOGS PARA DEBUG
            System.out.println("🛠️ Creando servicio:");
            System.out.println("Título: " + titulo);
            System.out.println("Días disponibles: " + diasDisponibles);
            System.out.println("Vendedor ID: " + vendedorId);
            System.out.println("Imágenes: " + (imagenes != null ? imagenes.size() : 0));

            // Buscar el vendedor
            Optional<Usuario> vendedorOpt = usuarioRepository.findById(vendedorId);

            if (!vendedorOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Vendedor no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            Usuario vendedor = vendedorOpt.get();

            // Verificar que la cuenta esté verificada
            if (!vendedor.isCuentaVerificada()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Debes verificar tu cuenta antes de publicar servicios");
                return ResponseEntity.badRequest().body(error);
            }

            // Verificar que la cuenta esté activa
            if (!"ACTIVO".equals(vendedor.getEstado())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Tu cuenta no está activa");
                return ResponseEntity.badRequest().body(error);
            }

            // Crear el servicio
            Servicio servicio = new Servicio(
                    titulo, categoria, descripcion, tipoPrecio, precio,
                    modalidad, ciudad, barrio, diasDisponibles, horario,
                    duracion, condiciones, vendedor
            );

            Servicio servicioCreado = servicioService.crearServicio(servicio, imagenes);
            return ResponseEntity.status(HttpStatus.CREATED).body(servicioCreado);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al crear servicio");
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarServicio(
            @PathVariable Long id,
            @RequestParam("titulo") String titulo,
            @RequestParam("categoria") String categoria,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("tipoPrecio") String tipoPrecio,
            @RequestParam(value = "precio", required = false, defaultValue = "0") BigDecimal precio,
            @RequestParam("modalidad") String modalidad,
            @RequestParam("ciudad") String ciudad,
            @RequestParam(value = "barrio", required = false) String barrio,
            @RequestParam("diasDisponibles") String diasDisponibles,
            @RequestParam(value = "horario", required = false) String horario,
            @RequestParam("duracion") String duracion,
            @RequestParam(value = "condiciones", required = false) String condiciones,
            @RequestParam(value = "imagenes", required = false) List<MultipartFile> imagenes) {

        try {
            Servicio servicioActualizado = new Servicio();
            servicioActualizado.setTitulo(titulo);
            servicioActualizado.setCategoria(categoria);
            servicioActualizado.setDescripcion(descripcion);
            servicioActualizado.setTipoPrecio(tipoPrecio);
            servicioActualizado.setPrecio(precio);
            servicioActualizado.setModalidad(modalidad);
            servicioActualizado.setCiudad(ciudad);
            servicioActualizado.setBarrio(barrio);
            servicioActualizado.setDiasDisponibles(diasDisponibles);
            servicioActualizado.setHorario(horario);
            servicioActualizado.setDuracion(duracion);
            servicioActualizado.setCondiciones(condiciones);

            Servicio servicio = servicioService.actualizarServicio(id, servicioActualizado, imagenes);
            return ResponseEntity.ok(servicio);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al actualizar servicio");
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarServicio(@PathVariable Long id) {
        try {
            boolean eliminado = servicioService.eliminarServicio(id);

            if (eliminado) {
                Map<String, String> respuesta = new HashMap<>();
                respuesta.put("message", "Servicio eliminado exitosamente");
                return ResponseEntity.ok(respuesta);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Servicio no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al eliminar servicio");
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // 🆕 CAMBIAR ESTADO DEL SERVICIO (ACTIVO/OCULTO)
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstadoServicio(@PathVariable Long id, @RequestParam String nuevoEstado) {
        try {
            Optional<Servicio> servicioOpt = servicioService.obtenerServicioPorId(id);

            if (servicioOpt.isPresent()) {
                Servicio servicio = servicioOpt.get();
                servicio.setEstado(nuevoEstado);
                Servicio servicioActualizado = servicioRepository.save(servicio);
                return ResponseEntity.ok(servicioActualizado);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Servicio no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al cambiar estado del servicio");
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Obtener servicios por usuario (alias de vendedor)
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> obtenerServiciosPorUsuario(@PathVariable Long usuarioId) {
        try {
            List<Servicio> servicios = servicioService.obtenerServiciosPorVendedor(usuarioId);
            return ResponseEntity.ok(servicios);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al obtener servicios del usuario");
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Actualización simple sin imágenes
    @PatchMapping("/{id}")
    public ResponseEntity<?> actualizarServicioSimple(@PathVariable Long id, @RequestBody Servicio servicioActualizado) {
        try {
            Optional<Servicio> servicioExistente = servicioService.obtenerServicioPorId(id);

            if (servicioExistente.isPresent()) {
                Servicio servicio = servicioExistente.get();

                if (servicioActualizado.getTitulo() != null) {
                    servicio.setTitulo(servicioActualizado.getTitulo());
                }
                if (servicioActualizado.getCategoria() != null) {
                    servicio.setCategoria(servicioActualizado.getCategoria());
                }
                if (servicioActualizado.getDescripcion() != null) {
                    servicio.setDescripcion(servicioActualizado.getDescripcion());
                }
                if (servicioActualizado.getTipoPrecio() != null) {
                    servicio.setTipoPrecio(servicioActualizado.getTipoPrecio());
                }
                if (servicioActualizado.getPrecio() != null) {
                    servicio.setPrecio(servicioActualizado.getPrecio());
                }
                if (servicioActualizado.getModalidad() != null) {
                    servicio.setModalidad(servicioActualizado.getModalidad());
                }
                if (servicioActualizado.getCiudad() != null) {
                    servicio.setCiudad(servicioActualizado.getCiudad());
                }
                if (servicioActualizado.getBarrio() != null) {
                    servicio.setBarrio(servicioActualizado.getBarrio());
                }
                if (servicioActualizado.getDiasDisponibles() != null) {
                    servicio.setDiasDisponibles(servicioActualizado.getDiasDisponibles());
                }
                if (servicioActualizado.getHorario() != null) {
                    servicio.setHorario(servicioActualizado.getHorario());
                }
                if (servicioActualizado.getDuracion() != null) {
                    servicio.setDuracion(servicioActualizado.getDuracion());
                }
                if (servicioActualizado.getCondiciones() != null) {
                    servicio.setCondiciones(servicioActualizado.getCondiciones());
                }

                Servicio servicioGuardado = servicioRepository.save(servicio);
                return ResponseEntity.ok(servicioGuardado);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Servicio no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al actualizar servicio");
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Endpoint adicional para obtener servicios por ciudad
    @GetMapping("/ciudad/{ciudad}")
    public ResponseEntity<?> obtenerServiciosPorCiudad(@PathVariable String ciudad) {
        try {
            List<Servicio> servicios = servicioService.obtenerServiciosPorCiudad(ciudad);
            return ResponseEntity.ok(servicios);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al obtener servicios por ciudad");
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Endpoint adicional para obtener servicios por modalidad
    @GetMapping("/modalidad/{modalidad}")
    public ResponseEntity<?> obtenerServiciosPorModalidad(@PathVariable String modalidad) {
        try {
            List<Servicio> servicios = servicioService.obtenerServiciosPorModalidad(modalidad);
            return ResponseEntity.ok(servicios);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al obtener servicios por modalidad");
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // 🆕 ENDPOINT PÚBLICO PARA EL CATÁLOGO
    @GetMapping("/public")
    public ResponseEntity<List<Servicio>> getServiciosPublicos() {
        try {
            List<Servicio> servicios = servicioRepository.findByActivoTrueAndEstado("ACTIVO");
            return ResponseEntity.ok(servicios);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // 🆕 ENDPOINT PÚBLICO PARA SERVICIO INDIVIDUAL
    @GetMapping("/public/{id}")
    public ResponseEntity<Servicio> getServicioPublico(@PathVariable Long id) {
        try {
            Optional<Servicio> servicio = servicioRepository.findById(id);
            if (servicio.isPresent() && servicio.get().getActivo() && "ACTIVO".equals(servicio.get().getEstado())) {
                return ResponseEntity.ok(servicio.get());
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}