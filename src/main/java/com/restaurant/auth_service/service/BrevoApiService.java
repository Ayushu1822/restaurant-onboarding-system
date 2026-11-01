package com.restaurant.auth_service.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BrevoApiService {

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    public void sendOtpEmail(String recipientEmail, String otpCode) {
        RestTemplate restTemplate = new RestTemplate();

        // Automatically read the API key from Render's environment variables
        String apiKey = System.getenv("BREVO_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            throw new RuntimeException("BREVO_API_KEY environment variable is not set!");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("sender", Map.of("name", "Orders24", "email", "novio4794@gmail.com"));
        body.put("to", List.of(Map.of("email", recipientEmail)));
        body.put("subject", "Your Password Reset OTP");
        body.put("htmlContent", "<p>Your 6-digit password reset OTP is: <strong>" + otpCode + "</strong></p>");

        HttpEntity request = new HttpEntity(body, headers);
        
        try {
            restTemplate.postForEntity(BREVO_API_URL, request, String.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email via Brevo API: " + e.getMessage());
        }
    }
}