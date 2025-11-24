package com.tuempresa.appventas.service;

import com.tuempresa.appventas.model.Historial;
import com.tuempresa.appventas.model.Usuario;
import com.tuempresa.appventas.model.Producto;
import com.tuempresa.appventas.model.Servicio;
import com.tuempresa.appventas.repository.HistorialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Date;

@Service
public class HistorialService {

    @Autowired
    private HistorialRepository historialRepository;

    public Historial registrarVista(Usuario usuario, Producto producto, Servicio servicio) {
        return registrarVista(usuario, producto, servicio, "VISTO");
    }

    public Historial registrarVista(Usuario usuario, Producto producto, Servicio servicio, String estado) {
        // Verificar si ya existe un registro similar en los últimos 5 minutos
        Historial historialExistente = null;
        Date fechaLimite = new Date(System.currentTimeMillis() - 5 * 60 * 1000); // 5 minutos atrás

        if (producto != null) {
            historialExistente = historialRepository.findByUsuarioIdAndProductoIdAndFechaVistoAfter(
                    usuario.getId(), producto.getId(), fechaLimite);
        } else if (servicio != null) {
            historialExistente = historialRepository.findByUsuarioIdAndServicioIdAndFechaVistoAfter(
                    usuario.getId(), servicio.getId(), fechaLimite);
        }

        if (historialExistente != null) {
            // SOLO actualizar si ha pasado más de 5 minutos
            System.out.println("⚠️ Visita duplicada en últimos 5 minutos - NO se actualiza");
            return historialExistente; // Retornar el existente sin actualizar fecha
        } else {
            // Crear nuevo registro con estado
            Historial historial = new Historial(usuario, producto, servicio, estado);
            System.out.println("✅ Nueva visita registrada: " +
                    (producto != null ? "Producto " + producto.getId() : "Servicio " + servicio.getId()) +
                    " - Estado: " + estado);
            return historialRepository.save(historial);
        }
    }

    // Método para marcar una transacción como completada
    public Historial marcarComoCompletado(Long historialId) {
        Historial historial = historialRepository.findById(historialId)
                .orElseThrow(() -> new RuntimeException("Historial no encontrado"));
        historial.setEstado("COMPLETADO");
        return historialRepository.save(historial);
    }

    // Método para obtener historial por estado
    public List<Historial> obtenerHistorialPorEstado(String estado) {
        // Necesitarías agregar este método al repository
        // List<Historial> findByEstado(String estado);
        return historialRepository.findAll().stream()
                .filter(h -> estado.equals(h.getEstado()))
                .toList();
    }

    public List<Historial> obtenerHistorialUsuario(Long usuarioId) {
        return historialRepository.findByUsuarioIdOrderByFechaVistoDesc(usuarioId);
    }
}