package com.tuempresa.appventas.service;

import com.tuempresa.appventas.model.*;
import com.tuempresa.appventas.repository.IncidenciaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

@Service
public class IncidenciaService {

    @Autowired
    private IncidenciaRepository incidenciaRepository;

    // Palabras prohibidas para detección automática
    private static final List<String> PALABRAS_PROHIBIDAS = Arrays.asList(
            "arma", "armas", "droga", "drogas", "explosivo", "explosivos",
            "robo", "robado", "robada", "ilegal", "ilegales", "pirateria",
            "falsificacion", "falsificado", "replica", "contrabando"
    );

    // Crear incidencia por detección automática de producto
    @Transactional
    public Incidencia crearIncidenciaAutomatica(Producto producto) {
        String motivoDeteccion = detectarContenidoProhibido(
                producto.getNombre(),
                producto.getDescripcion()
        );

        if (motivoDeteccion != null) {
            Incidencia incidencia = new Incidencia(producto, motivoDeteccion, producto.getVendedor());
            return incidenciaRepository.save(incidencia);
        }
        return null;
    }

    // Crear incidencia por detección automática de servicio
    @Transactional
    public Incidencia crearIncidenciaAutomatica(Servicio servicio) {
        String motivoDeteccion = detectarContenidoProhibido(
                servicio.getTitulo(),
                servicio.getDescripcion()
        );

        if (motivoDeteccion != null) {
            Incidencia incidencia = new Incidencia(servicio, motivoDeteccion, servicio.getVendedor());
            return incidenciaRepository.save(incidencia);
        }
        return null;
    }

    // Crear incidencia por reporte de comprador
    @Transactional
    public Incidencia crearIncidenciaReporte(Producto producto, Usuario reportador, String descripcion) {
        Incidencia incidencia = new Incidencia(producto, reportador, descripcion, producto.getVendedor());
        incidencia.setTipo("REPORTE_COMPRADOR");
        return incidenciaRepository.save(incidencia);
    }

    // Crear incidencia por reporte de comprador para servicio
    @Transactional
    public Incidencia crearIncidenciaReporte(Servicio servicio, Usuario reportador, String descripcion) {
        Incidencia incidencia = new Incidencia(servicio, reportador, descripcion, servicio.getVendedor());
        incidencia.setTipo("REPORTE_COMPRADOR");
        return incidenciaRepository.save(incidencia);
    }

    // Crear incidencia por reporte de moderador
    @Transactional
    public Incidencia crearIncidenciaModerador(Producto producto, Usuario moderador, String descripcion) {
        Incidencia incidencia = new Incidencia(producto, moderador, descripcion, producto.getVendedor());
        incidencia.setTipo("REPORTE_MODERADOR");
        incidencia.setModeradorEncargado(moderador);
        incidencia.setFechaAsignacion(new Date());
        return incidenciaRepository.save(incidencia);
    }

    // Crear incidencia por reporte de moderador para servicio
    @Transactional
    public Incidencia crearIncidenciaModerador(Servicio servicio, Usuario moderador, String descripcion) {
        Incidencia incidencia = new Incidencia(servicio, moderador, descripcion, servicio.getVendedor());
        incidencia.setTipo("REPORTE_MODERADOR");
        incidencia.setModeradorEncargado(moderador);
        incidencia.setFechaAsignacion(new Date());
        return incidenciaRepository.save(incidencia);
    }

    // Asignar incidencia a un moderador
    @Transactional
    public Incidencia asignarIncidencia(Long incidenciaId, Usuario moderador) {
        Incidencia incidencia = incidenciaRepository.findById(incidenciaId)
                .orElseThrow(() -> new RuntimeException("Incidencia no encontrada"));

        incidencia.setModeradorEncargado(moderador);
        incidencia.setFechaAsignacion(new Date());
        incidencia.setEstado("EN_REVISION");

        return incidenciaRepository.save(incidencia);
    }

    // Resolver incidencia
    @Transactional
    public Incidencia resolverIncidencia(Long incidenciaId, String decision, String comentario) {
        Incidencia incidencia = incidenciaRepository.findById(incidenciaId)
                .orElseThrow(() -> new RuntimeException("Incidencia no encontrada"));

        incidencia.setDecision(decision);
        incidencia.setComentarioModerador(comentario);
        incidencia.setEstado("RESUELTO");
        incidencia.setFechaResolucion(new Date());

        // Actualizar estado del producto/servicio según la decisión
        if ("PRODUCTO_PROHIBIDO".equals(decision)) {
            if (incidencia.getProducto() != null) {
                incidencia.getProducto().setEstado("PROHIBIDO");
            } else if (incidencia.getServicio() != null) {
                incidencia.getServicio().setEstado("PROHIBIDO");
            }
        } else if ("PRODUCTO_PERMITIDO".equals(decision)) {
            if (incidencia.getProducto() != null) {
                incidencia.getProducto().setEstado("ACTIVO");
            } else if (incidencia.getServicio() != null) {
                incidencia.getServicio().setEstado("ACTIVO");
            }
        }

        return incidenciaRepository.save(incidencia);
    }

    // Marcar incidencia como apelada
    @Transactional
    public Incidencia marcarComoApelada(Long incidenciaId) {
        Incidencia incidencia = incidenciaRepository.findById(incidenciaId)
                .orElseThrow(() -> new RuntimeException("Incidencia no encontrada"));

        incidencia.setEstado("APELADO");
        return incidenciaRepository.save(incidencia);
    }

    // Obtener incidencias pendientes
    public List<Incidencia> obtenerIncidenciasPendientes() {
        return incidenciaRepository.findIncidenciasPendientes();
    }

    // Obtener incidencias sin asignar
    public List<Incidencia> obtenerIncidenciasSinAsignar() {
        return incidenciaRepository.findIncidenciasSinAsignar();
    }

    // Obtener incidencias por moderador
    public List<Incidencia> obtenerIncidenciasPorModerador(Long moderadorId) {
        return incidenciaRepository.findByModeradorEncargadoId(moderadorId);
    }

    // Obtener incidencias por vendedor
    public List<Incidencia> obtenerIncidenciasPorVendedor(Long vendedorId) {
        return incidenciaRepository.findByVendedorId(vendedorId);
    }

    // Obtener todas las incidencias
    public List<Incidencia> obtenerTodasIncidencias() {
        return incidenciaRepository.findAll();
    }

    // Obtener incidencia por ID
    public Incidencia obtenerIncidenciaPorId(Long id) {
        return incidenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incidencia no encontrada"));
    }

    // Filtrar incidencias por fecha
    public List<Incidencia> filtrarPorFecha(Date fechaInicio, Date fechaFin) {
        return incidenciaRepository.findByFechaIncidenciaBetween(fechaInicio, fechaFin);
    }

    // Detectar contenido prohibido en texto
    private String detectarContenidoProhibido(String titulo, String descripcion) {
        String textoCompleto = (titulo + " " + descripcion).toLowerCase();

        for (String palabraProhibida : PALABRAS_PROHIBIDAS) {
            if (textoCompleto.contains(palabraProhibida)) {
                return "Palabra prohibida detectada: " + palabraProhibida;
            }
        }

        return null; // No se detectó contenido prohibido
    }

    // Verificar si un producto tiene incidencias activas
    public boolean productoTieneIncidenciasActivas(Long productoId) {
        return incidenciaRepository.productoTieneIncidenciasActivas(productoId);
    }

    // Verificar si un servicio tiene incidencias activas
    public boolean servicioTieneIncidenciasActivas(Long servicioId) {
        return incidenciaRepository.servicioTieneIncidenciasActivas(servicioId);
    }
}
