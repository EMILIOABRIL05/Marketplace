package com.tuempresa.appventas.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tuempresa.appventas.model.Servicio;
import com.tuempresa.appventas.repository.FavoritoRepository;
import com.tuempresa.appventas.repository.MensajeRepository;
import com.tuempresa.appventas.repository.ServicioRepository;
import com.tuempresa.appventas.repository.UsuarioRepository;

@Service
public class ServicioService {

    @Autowired
    private ServicioRepository servicioRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private MensajeRepository mensajeRepository;
    
    @Autowired
    private FavoritoRepository favoritoRepository;

    @Autowired
    private IncidenciaService incidenciaService;

    private final String UPLOAD_DIR = "uploads/servicios/";
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Para el catálogo público: solo servicios activos y visibles
    public List<Servicio> obtenerTodosLosServicios() {
        return servicioRepository.findByActivoTrueAndEstado("ACTIVO");
    }

    // Para el perfil del usuario: todos sus servicios (activos e ocultos)
    public List<Servicio> obtenerTodosLosServiciosParaPerfil() {
        return servicioRepository.findByActivoTrue();
    }

    public Optional<Servicio> obtenerServicioPorId(Long id) {
        return servicioRepository.findByIdAndActivoTrue(id);
    }

    public List<Servicio> obtenerServiciosPorVendedor(Long vendedorId) {
        return servicioRepository.findByVendedorIdAndActivoTrue(vendedorId);
    }

    public List<Servicio> obtenerServiciosPorCategoria(String categoria) {
        return servicioRepository.findByCategoriaAndActivoTrueAndEstado(categoria, "ACTIVO");
    }

    public List<Servicio> obtenerServiciosPorCiudad(String ciudad) {
        return servicioRepository.findByCiudadAndActivoTrueAndEstado(ciudad, "ACTIVO");
    }

    public List<Servicio> obtenerServiciosPorModalidad(String modalidad) {
        return servicioRepository.findByModalidadAndActivoTrueAndEstado(modalidad, "ACTIVO");
    }

    // 🆕 CREAR SERVICIO - CORREGIDO
    public Servicio crearServicio(Servicio servicio, List<MultipartFile> imagenes) throws IOException {
        // ✅ PROCESAR DIAS DISPONIBLES
        if (servicio.getDiasDisponibles() != null) {
            try {
                // Si viene como array JSON, convertirlo a string legible
                if (servicio.getDiasDisponibles().startsWith("[")) {
                    List<String> diasList = objectMapper.readValue(servicio.getDiasDisponibles(), List.class);
                    servicio.setDiasDisponibles(String.join(", ", diasList));
                }
                // Si viene separado por comas, dejarlo como está
            } catch (Exception e) {
                System.out.println("⚠️ No se pudo procesar días disponibles: " + e.getMessage());
                // Dejar el string original
            }
        }

        // Guardar imágenes si existen
        if (imagenes != null && !imagenes.isEmpty()) {
            List<String> urlImagenes = guardarImagenes(imagenes);
            servicio.setImagenes(objectMapper.writeValueAsString(urlImagenes));
        }

        // Establecer estado por defecto
        servicio.setEstado("ACTIVO");

        // Guardar el servicio primero
        Servicio servicioGuardado = servicioRepository.save(servicio);

        // Detectar contenido prohibido automáticamente
        try {
            incidenciaService.crearIncidenciaAutomatica(servicioGuardado);
        } catch (Exception e) {
            System.err.println("Error al detectar contenido prohibido: " + e.getMessage());
        }

        return servicioGuardado;
    }

    public Servicio actualizarServicio(Long id, Servicio servicioActualizado, List<MultipartFile> imagenes) throws IOException {
        Optional<Servicio> servicioExistente = servicioRepository.findByIdAndActivoTrue(id);

        if (servicioExistente.isPresent()) {
            Servicio servicio = servicioExistente.get();

            servicio.setTitulo(servicioActualizado.getTitulo());
            servicio.setCategoria(servicioActualizado.getCategoria());
            servicio.setDescripcion(servicioActualizado.getDescripcion());
            servicio.setTipoPrecio(servicioActualizado.getTipoPrecio());
            servicio.setPrecio(servicioActualizado.getPrecio());
            servicio.setModalidad(servicioActualizado.getModalidad());
            servicio.setCiudad(servicioActualizado.getCiudad());
            servicio.setBarrio(servicioActualizado.getBarrio());
            servicio.setDiasDisponibles(servicioActualizado.getDiasDisponibles());
            servicio.setHorario(servicioActualizado.getHorario());
            servicio.setDuracion(servicioActualizado.getDuracion());
            servicio.setCondiciones(servicioActualizado.getCondiciones());

            // Si hay nuevas imágenes, actualizarlas
            if (imagenes != null && !imagenes.isEmpty()) {
                List<String> urlImagenes = guardarImagenes(imagenes);
                servicio.setImagenes(objectMapper.writeValueAsString(urlImagenes));
            }

            return servicioRepository.save(servicio);
        }

        throw new RuntimeException("Servicio no encontrado con ID: " + id);
    }

    // MÉTODO PARA CAMBIAR SOLO EL ESTADO DE VISIBILIDAD
    public Servicio cambiarEstadoServicio(Long id, String nuevoEstado) {
        Optional<Servicio> servicioExistente = servicioRepository.findByIdAndActivoTrue(id);

        if (servicioExistente.isPresent()) {
            Servicio servicio = servicioExistente.get();
            servicio.setEstado(nuevoEstado);
            return servicioRepository.save(servicio);
        }

        throw new RuntimeException("Servicio no encontrado con ID: " + id);
    }

    public boolean eliminarServicio(Long id) {
        Optional<Servicio> servicio = servicioRepository.findByIdAndActivoTrue(id);

        if (servicio.isPresent()) {
            Servicio servicioAEliminar = servicio.get();
            servicioAEliminar.setActivo(false);
            servicioRepository.save(servicioAEliminar);
            return true;
        }

        return false;
    }
    
    // Eliminar servicio definitivamente (físicamente de la BD)
    @Transactional
    public void eliminarServicioDefinitivo(Long id) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
        
        // 1. Borrar mensajes relacionados
        try {
            mensajeRepository.deleteByServicioId(id);
            System.out.println("✅ Mensajes eliminados para servicio: " + id);
        } catch (Exception e) {
            System.err.println("⚠️ Error borrando mensajes: " + e.getMessage());
        }
        
        // 2. Borrar favoritos relacionados
        try {
            favoritoRepository.deleteByServicioId(id);
            System.out.println("✅ Favoritos eliminados para servicio: " + id);
        } catch (Exception e) {
            System.err.println("⚠️ Error borrando favoritos: " + e.getMessage());
        }
        
        // 3. Finalmente borrar el servicio
        servicioRepository.delete(servicio);
        System.out.println("✅ Servicio eliminado exitosamente: " + id);
    }

    private List<String> guardarImagenes(List<MultipartFile> imagenes) throws IOException {
        List<String> urlImagenes = new ArrayList<>();

        // Crear directorio si no existe
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        for (MultipartFile imagen : imagenes) {
            if (!imagen.isEmpty()) {
                String nombreArchivo = UUID.randomUUID().toString() + "_" + imagen.getOriginalFilename();
                Path rutaArchivo = uploadPath.resolve(nombreArchivo);
                Files.copy(imagen.getInputStream(), rutaArchivo);
                urlImagenes.add("/uploads/servicios/" + nombreArchivo);
            }
        }

        return urlImagenes;
    }
}