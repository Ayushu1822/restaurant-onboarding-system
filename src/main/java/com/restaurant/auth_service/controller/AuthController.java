package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.User;
import com.restaurant.auth_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = {"https://restaurant-system-sand-gamma.vercel.app", "http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> request) {
        try {
            User newUser = authService.registerUser(request);
            Map<String, Object> body = new HashMap<>();
            body.put("message", "Registration successful! Please sign in.");
            body.put("userId", newUser.getUserId());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            e.printStackTrace();
            String msg = e.getMessage() != null ? e.getMessage() : "Registration failed";
            Map<String, Object> body = new HashMap<>();
            body.put("message", msg);
            return ResponseEntity.badRequest().body(body);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");

            Map<String, Object> response = authService.loginUser(email, password);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> body = new HashMap<>();
            body.put("message", "Invalid email or password");
            return ResponseEntity.status(401).body(body);
        }
    }

    // --- OTP: Forgot Password Endpoint ---
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            authService.forgotPassword(email);
            return ResponseEntity.ok(Map.of("message", "If the email exists, a 6-digit OTP has been sent."));
        } catch (Exception e) {
            e.printStackTrace();
            // Return success even if email is missing to prevent user enumeration attacks
            return ResponseEntity.ok(Map.of("message", "If the email exists, a 6-digit OTP has been sent."));
        }
    }

    // --- OTP: Verify and Reset Password Endpoint ---
    @PostMapping("/reset-password-otp")
    public ResponseEntity<?> resetPasswordOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otp = request.get("otp");
            String newPassword = request.get("newPassword");
            
            authService.verifyOtpAndResetPassword(email, otp, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password successfully reset!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Reset failed"));
        }
    }
}