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
    private static final String API_KEY = "xsmtpsib-8ce57c59e6d693e10765b7b4ce1bf7f2607ee699b558c620d75e18f5422ac295-Jd7yLlqRPyMvHaam";

    public void sendOtpEmail(String recipientEmail, String otpCode) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", API_KEY);

        Map<String, Object> body = new HashMap<>();
        body.put("sender", Map.of("name", "Orders24", "email", "novio4794@gmail.com"));
        body.put("to", List.of(Map.of("email", recipientEmail)));
        body.put("subject", "Your Password Reset OTP");
        body.put("htmlContent", "<p>Your 6-digit password reset OTP is: <strong>" + otpCode + "</strong></p>");

        // Using a raw HttpEntity to completely avoid any generic bracket errors
        HttpEntity request = new HttpEntity(body, headers);
        
        try {
            restTemplate.postForEntity(BREVO_API_URL, request, String.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email via Brevo API: " + e.getMessage());
        }
    }
}