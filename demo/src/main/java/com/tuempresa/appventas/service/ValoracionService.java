package com.tuempresa.appventas.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tuempresa.appventas.model.Usuario;
import com.tuempresa.appventas.model.Valoracion;
import com.tuempresa.appventas.repository.UsuarioRepository;
import com.tuempresa.appventas.repository.ValoracionRepository;

@Service
public class ValoracionService {

    @Autowired
    private ValoracionRepository valoracionRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Transactional
    public Valoracion crearValoracion(Long vendedorId, Long compradorId, int calificacion, String comentario) {
        if (vendedorId.equals(compradorId)) {
            throw new IllegalArgumentException("No puedes valorarte a ti mismo");
        }
        if (calificacion < 1 || calificacion > 5) {
            throw new IllegalArgumentException("La calificación debe estar entre 1 y 5");
        }

        Usuario vendedor = usuarioRepository.findById(vendedorId)
            .orElseThrow(() -> new RuntimeException("Vendedor no encontrado"));
        Usuario comprador = usuarioRepository.findById(compradorId)
            .orElseThrow(() -> new RuntimeException("Comprador no encontrado"));

        Valoracion valoracion = new Valoracion();
        valoracion.setVendedor(vendedor);
        valoracion.setComprador(comprador);
        valoracion.setCalificacion(calificacion);
        valoracion.setComentario(comentario);

        return valoracionRepository.save(valoracion);
    }

    public List<Valoracion> obtenerValoracionesPorVendedor(Long vendedorId) {
        return valoracionRepository.findByVendedorIdOrderByFechaCreacionDesc(vendedorId);
    }

    public Map<String, Object> obtenerResumenValoraciones(Long vendedorId) {
        Double promedio = valoracionRepository.obtenerPromedioPorVendedor(vendedorId);
        Long total = valoracionRepository.contarPorVendedor(vendedorId);

        Map<String, Object> resumen = new HashMap<>();
        resumen.put("promedio", promedio != null ? Math.round(promedio * 10.0) / 10.0 : 0.0);
        resumen.put("total", total != null ? total : 0L);
        return resumen;
    }

    public boolean yaHaValorado(Long vendedorId, Long compradorId) {
        return valoracionRepository.existsByVendedorIdAndCompradorId(vendedorId, compradorId);
    }
}
