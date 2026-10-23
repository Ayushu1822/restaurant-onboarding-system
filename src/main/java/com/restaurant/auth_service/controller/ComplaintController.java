package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.Complaint;
import com.restaurant.auth_service.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/complaints", "/api/v1/complaints"})
@CrossOrigin(origins = {"https://restaurant-system-sand-gamma.vercel.app", "http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class ComplaintController {

    @Autowired
    private ComplaintRepository complaintRepository;

    // ✅ FETCH COMPLAINTS STRICTLY FILTERED BY RESTAURANT EMAIL
    @GetMapping
    public List<Complaint> getAllComplaints(@RequestParam(required = false) String email) {
        List<Complaint> allComplaints = complaintRepository.findAll();
        
        if (email == null || email.trim().isEmpty()) {
            return List.of(); // Safety: agar email nahi di toh empty return karo
        }

        return allComplaints.stream()
            .filter(c -> c.getRestaurantEmail() != null && c.getRestaurantEmail().equalsIgnoreCase(email))
            .collect(Collectors.toList());
    }

    // ✅ CREATE COMPLAINT TIED TO LOGGED-IN RESTAURANT EMAIL
    @PostMapping
    public ResponseEntity<Complaint> createComplaint(@RequestBody Complaint complaint) {
        if (complaint.getStatus() == null || complaint.getStatus().isEmpty()) {
            complaint.setStatus("Open");
        }

        if (complaint.getRestaurantEmail() == null || complaint.getRestaurantEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Complaint saved = complaintRepository.save(complaint);
        System.out.println("✅ COMPLAINT CREATED for restaurant: " + saved.getRestaurantEmail());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Complaint> updateComplaintStatus(@PathVariable Long id, @RequestParam String status) {
        Optional<Complaint> optionalComplaint = complaintRepository.findById(id);
        if (optionalComplaint.isPresent()) {
            Complaint complaint = optionalComplaint.get();
            complaint.setStatus(status);
            Complaint updated = complaintRepository.save(complaint);
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }
}