package com.restaurant.auth_service.service;

import com.restaurant.auth_service.dto.LoginRequest;
import com.restaurant.auth_service.dto.RegisterRequest;
import com.restaurant.auth_service.model.User;
import com.restaurant.auth_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Register User
    public String registerUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered!");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setBusinessName(request.getBusinessName());
        user.setOwnerName(request.getOwnerName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setWhatsappNumber(request.getWhatsappNumber());
        
        // Save to PostgreSQL database
        userRepository.save(user);
        return "User registered successfully!";
    }

    // Login User (Generates a secure token/session identifier)
    public String loginUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Return email or session token so frontend can authenticate subsequent calls
        return user.getEmail(); 
    }

    // Password Reset Token Generator
    public String generatePasswordResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found in database"));
        
        // Generate a mock reset token
        return UUID.randomUUID().toString();
    }

    // NEW: Fetch User Profile from Database using Token/Email
    public User getUserByTokenOrEmail(String identifier) {
        // Here 'identifier' can be the email passed from the login token
        Optional<User> userOpt = userRepository.findByEmail(identifier);
        if (userOpt.isPresent()) {
            return userOpt.get();
        }
        throw new RuntimeException("User profile not found in database.");
    }

    // NEW: Update Profile directly in PostgreSQL Database
    public User updateUserData(String identifier, User updatedData) {
        User user = userRepository.findByEmail(identifier)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updatedData.getBusinessName() != null) {
            user.setBusinessName(updatedData.getBusinessName());
        }
        if (updatedData.getOwnerName() != null) {
            user.setOwnerName(updatedData.getOwnerName());
        }
        if (updatedData.getPhoneNumber() != null) {
            user.setPhoneNumber(updatedData.getPhoneNumber());
        }

        return userRepository.save(user); // Commits updates to PostgreSQL
    }
}