package com.emailAssist.emailAssist.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/ping")
                        .allowedOrigins("*");

                registry.addMapping("/api/generate")
                        .allowedOrigins("https://mail.google.com")
                        .allowedMethods("POST");
            }
        };
    }
}
