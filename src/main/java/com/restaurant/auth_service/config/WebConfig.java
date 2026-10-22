package com.restaurant.auth_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Yeh line local uploads folder ko public URL /uploads/** par map kar degi
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}