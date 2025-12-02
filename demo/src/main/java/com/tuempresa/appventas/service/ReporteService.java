package com.tuempresa.appventas.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tuempresa.appventas.model.Producto;
import com.tuempresa.appventas.model.Reporte;
import com.tuempresa.appventas.model.Servicio;
import com.tuempresa.appventas.model.Usuario;
import com.tuempresa.appventas.repository.ReporteRepository;

@Service
public class ReporteService {

    @Autowired
    private ReporteRepository reporteRepository;

    @Autowired
    private IncidenciaService incidenciaService;

    // Método para reportar productos
    public Reporte crearReporteProducto(Usuario usuario, Producto producto, String motivo, String descripcion) {
        Reporte reporte = new Reporte(usuario, producto, motivo, descripcion);
        
        // Crear también una incidencia para que aparezca en el panel de moderación
        String descripcionCompleta = "Motivo: " + motivo + ". Detalles: " + descripcion;
        incidenciaService.crearIncidenciaReporte(producto, usuario, descripcionCompleta);
        
        return reporteRepository.save(reporte);
    }

    // 🆕 NUEVO: Método para reportar servicios
    public Reporte crearReporteServicio(Usuario usuario, Servicio servicio, String motivo, String descripcion) {
        Reporte reporte = new Reporte(usuario, servicio, motivo, descripcion);
        
        // Crear también una incidencia para que aparezca en el panel de moderación
        String descripcionCompleta = "Motivo: " + motivo + ". Detalles: " + descripcion;
        incidenciaService.crearIncidenciaReporte(servicio, usuario, descripcionCompleta);
        
        return reporteRepository.save(reporte);
    }

    public List<Reporte> obtenerReportesPendientes() {
        return reporteRepository.findByEstado("PENDIENTE");
    }

    public List<Reporte> obtenerReportesProducto(Long productoId) {
        return reporteRepository.findByProductoId(productoId);
    }

    // 🆕 NUEVO: Obtener reportes de un servicio
    public List<Reporte> obtenerReportesServicio(Long servicioId) {
        return reporteRepository.findByServicioId(servicioId);
    }
}