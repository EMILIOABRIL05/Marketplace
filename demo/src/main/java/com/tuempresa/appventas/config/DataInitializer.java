package com.tuempresa.appventas.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.tuempresa.appventas.model.Usuario;
import com.tuempresa.appventas.repository.UsuarioRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "veycoflash20@gmail.com";
        
        if (usuarioRepository.findByEmail(adminEmail) == null) {
            System.out.println(">>> CREANDO USUARIO ADMINISTRADOR POR DEFECTO: " + adminEmail);
            
            Usuario admin = new Usuario();
            admin.setNombre("VeycoFlash");
            admin.setApellido("Administrador");
            admin.setCedula("9999999999"); // Cédula ficticia para el sistema
            admin.setEmail(adminEmail);
            admin.setTelefono("0999999999");
            admin.setDireccion("Oficina Central VeycoFlash");
            admin.setGenero("Otro");
            
            // Contraseña solicitada
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            admin.setPassword(encoder.encode("vecyco052737@flash"));
            
            admin.setTipoUsuario("ADMINISTRADOR");
            admin.setEstado("ACTIVO");
            admin.setCuentaVerificada(true);
            
            usuarioRepository.save(admin);
            System.out.println(">>> ADMINISTRADOR CREADO EXITOSAMENTE");
        } else {
            System.out.println(">>> EL ADMINISTRADOR YA EXISTE: " + adminEmail);
        }
    }
}
