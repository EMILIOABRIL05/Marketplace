package com.tuempresa.appventas.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(authorize -> authorize
                        // Rutas públicas para autenticación
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/recuperar-password/**").permitAll()
                        .requestMatchers("/api/verificar-email/**").permitAll()

                        // Dashboard - temporalmente permitido para testing
                        .requestMatchers("/api/dashboard/**").permitAll()

                        // ENDPOINTS PÚBLICOS EXPLÍCITOS
                        .requestMatchers("/api/productos/public/**").permitAll()
                        .requestMatchers("/api/servicios/public/**").permitAll()
                        .requestMatchers("/api/productos/public").permitAll()
                        .requestMatchers("/api/servicios/public").permitAll()

                        // ✅ PERMITIR CREACIÓN DE PRODUCTOS Y SERVICIOS (TEMPORAL)
                        .requestMatchers("/api/productos").permitAll()
                        .requestMatchers("/api/servicios").permitAll()
                        .requestMatchers("/api/productos/**").permitAll()
                        .requestMatchers("/api/servicios/**").permitAll()

                        // FAVORITOS - Permitir todas las operaciones
                        .requestMatchers("/api/favoritos/**").permitAll()

                        // REPORTES - Permitir reportes
                        .requestMatchers("/api/reportes/**").permitAll()

                        // HISTORIAL - Permitir consultas de historial
                        .requestMatchers("/api/historial/**").permitAll()

                        // Archivos estáticos
                        .requestMatchers("/uploads/**").permitAll()

                        // TODOS LOS DEMÁS ENDPOINTS REQUIEREN AUTENTICACIÓN
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}