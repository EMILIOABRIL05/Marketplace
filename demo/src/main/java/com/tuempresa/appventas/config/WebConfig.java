package com.tuempresa.appventas.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Obtener ruta absoluta del directorio uploads
        String uploadPath = System.getProperty("user.dir") + File.separator + "uploads" + File.separator;

        // Servir archivos desde la carpeta uploads/
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath);

        System.out.println("📁 Sirviendo archivos desde: " + uploadPath);
    }
}