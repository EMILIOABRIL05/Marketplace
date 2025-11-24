package com.tuempresa.appventas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.tuempresa.appventas.model.Producto;
import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    // 🆕 MÉTODO NECESARIO PARA EL ENDPOINT PÚBLICO
    List<Producto> findByEstado(String estado);

    List<Producto> findByVendedorId(Long vendedorId);

    // Búsqueda por nombre
    @Query("SELECT p FROM Producto p WHERE p.nombre LIKE %:nombre% AND p.estado = 'ACTIVO'")
    List<Producto> buscarPorNombre(@Param("nombre") String nombre);

    // Búsqueda por rango de precios
    @Query("SELECT p FROM Producto p WHERE p.precio BETWEEN :precioMin AND :precioMax AND p.estado = 'ACTIVO'")
    List<Producto> buscarPorRangoPrecio(@Param("precioMin") Double precioMin,
                                        @Param("precioMax") Double precioMax);

    // MÉTODOS PARA DASHBOARD
    @Query("SELECT COUNT(p) FROM Producto p WHERE FUNCTION('MONTH', p.fechaPublicacion) = FUNCTION('MONTH', CURRENT_DATE) AND FUNCTION('YEAR', p.fechaPublicacion) = FUNCTION('YEAR', CURRENT_DATE)")
    Long countProductosEsteMes();
}