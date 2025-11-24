package com.tuempresa.appventas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.tuempresa.appventas.model.Usuario;

import java.time.LocalDateTime;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Usuario findByEmail(String email);
    Usuario findByCedula(String cedula);

    // NUEVO: Buscar por token de verificación
    Usuario findByVerificationToken(String token);

    // MÉTODOS PARA DASHBOARD
    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.fechaRegistro >= :fecha")
    Long countUsuariosActivosUltimos30Dias(@Param("fecha") LocalDateTime fecha);

    @Query("SELECT COUNT(u) FROM Usuario u WHERE FUNCTION('MONTH', u.fechaRegistro) = FUNCTION('MONTH', CURRENT_DATE) AND FUNCTION('YEAR', u.fechaRegistro) = FUNCTION('YEAR', CURRENT_DATE)")
    Long countUsuariosRegistradosEsteMes();

    default Long countUsuariosActivosUltimos30Dias() {
        LocalDateTime fechaLimite = LocalDateTime.now().minusDays(30);
        return countUsuariosActivosUltimos30Dias(fechaLimite);
    }
}