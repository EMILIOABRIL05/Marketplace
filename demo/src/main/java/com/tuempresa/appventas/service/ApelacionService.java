package com.tuempresa.appventas.service;

import com.tuempresa.appventas.model.Apelacion;
import com.tuempresa.appventas.model.Incidencia;
import com.tuempresa.appventas.model.Usuario;
import com.tuempresa.appventas.repository.ApelacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
public class ApelacionService {

    @Autowired
    private ApelacionRepository apelacionRepository;

    @Autowired
    private IncidenciaService incidenciaService;

    // Crear una apelación
    @Transactional
    public Apelacion crearApelacion(Incidencia incidencia, Usuario vendedor, String motivo, String justificacion) {
        // Verificar que la incidencia esté resuelta
        if (!"RESUELTO".equals(incidencia.getEstado())) {
            throw new RuntimeException("Solo se pueden apelar incidencias resueltas");
        }

        // Verificar que el vendedor sea el dueño del producto/servicio
        if (!incidencia.getVendedor().getId().equals(vendedor.getId())) {
            throw new RuntimeException("Solo el vendedor puede apelar esta incidencia");
        }

        Apelacion apelacion = new Apelacion(incidencia, vendedor, motivo, justificacion);
        apelacion = apelacionRepository.save(apelacion);

        // Marcar la incidencia como apelada
        incidenciaService.marcarComoApelada(incidencia.getId());

        return apelacion;
    }

    // Asignar apelación a un moderador diferente
    @Transactional
    public Apelacion asignarApelacion(Long apelacionId, Usuario moderador) {
        Apelacion apelacion = apelacionRepository.findById(apelacionId)
                .orElseThrow(() -> new RuntimeException("Apelación no encontrada"));

        // Verificar que sea un moderador diferente al que revisó la incidencia original
        if (apelacion.getIncidencia().getModeradorEncargado() != null &&
            apelacion.getIncidencia().getModeradorEncargado().getId().equals(moderador.getId())) {
            throw new RuntimeException("La apelación debe ser revisada por un moderador diferente");
        }

        apelacion.setModeradorRevisor(moderador);
        apelacion.setEstado("EN_REVISION");

        return apelacionRepository.save(apelacion);
    }

    // Resolver apelación
    @Transactional
    public Apelacion resolverApelacion(Long apelacionId, String decisionFinal, String comentario) {
        Apelacion apelacion = apelacionRepository.findById(apelacionId)
                .orElseThrow(() -> new RuntimeException("Apelación no encontrada"));

        apelacion.setDecisionFinal(decisionFinal);
        apelacion.setComentarioRevisor(comentario);
        apelacion.setFechaRevision(new Date());

        if ("APELACION_APROBADA".equals(decisionFinal)) {
            apelacion.setEstado("APROBADA");
            // Cambiar el estado del producto/servicio a ACTIVO
            Incidencia incidencia = apelacion.getIncidencia();
            if (incidencia.getProducto() != null) {
                incidencia.getProducto().setEstado("ACTIVO");
            } else if (incidencia.getServicio() != null) {
                incidencia.getServicio().setEstado("ACTIVO");
            }
        } else {
            apelacion.setEstado("RECHAZADA");
            // Mantener el producto/servicio como PROHIBIDO
        }

        return apelacionRepository.save(apelacion);
    }

    // Obtener apelaciones pendientes
    public List<Apelacion> obtenerApelacionesPendientes() {
        return apelacionRepository.findApelacionesPendientes();
    }

    // Obtener apelaciones por vendedor
    public List<Apelacion> obtenerApelacionesPorVendedor(Long vendedorId) {
        return apelacionRepository.findByVendedorId(vendedorId);
    }

    // Obtener apelaciones por moderador
    public List<Apelacion> obtenerApelacionesPorModerador(Long moderadorId) {
        return apelacionRepository.findByModeradorRevisorId(moderadorId);
    }

    // Obtener apelación por ID
    public Apelacion obtenerApelacionPorId(Long id) {
        return apelacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apelación no encontrada"));
    }

    // Obtener todas las apelaciones
    public List<Apelacion> obtenerTodasApelaciones() {
        return apelacionRepository.findAll();
    }
}
