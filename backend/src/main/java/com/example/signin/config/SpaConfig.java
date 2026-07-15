package com.example.signin.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

/**
 * Permite que Spring Boot sirva el frontend de React (build de Vite) que se
 * copia en resources/static. Si la ruta pedida no es un archivo real ni una
 * ruta de la API, devuelve index.html para que React Router maneje la
 * navegación (necesario para que funcionen rutas como /dashboard al recargar).
 *
 * Las rutas de la API (/api/**) las siguen atendiendo los @RestController,
 * que tienen prioridad sobre este manejador de recursos.
 */
@Configuration
public class SpaConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws java.io.IOException {
                        Resource requested = location.createRelative(resourcePath);
                        if (requested.exists() && requested.isReadable()) {
                            return requested;
                        }
                        // Fallback al index.html (solo si el frontend fue copiado a static/)
                        Resource index = new ClassPathResource("/static/index.html");
                        return index.exists() ? index : null;
                    }
                });
    }
}
