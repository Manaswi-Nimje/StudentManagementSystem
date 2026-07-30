package com.studentapp.studentmanagement.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    // Reads app.cors.allowed-origins from application.properties, which in
    // turn reads the CORS_ALLOWED_ORIGINS env var. Accepts a comma-separated
    // list so both the local Angular dev server and a deployed frontend can
    // be allowed at once.
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    // Exposed as a CorsFilter (rather than a WebMvcConfigurer) so it can be
    // wired directly into Spring Security's filter chain, ahead of the
    // authentication filters — that way preflight/OPTIONS requests and 401
    // responses both carry the right CORS headers, not just successful ones.
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> origins = Arrays.asList(allowedOrigins.split("\\s*,\\s*"));
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
