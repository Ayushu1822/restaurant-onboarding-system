package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.Staff;
import com.restaurant.auth_service.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/staff", "/api/v1/staff"})
@CrossOrigin(origins = {"https://restaurant-system-sand-gamma.vercel.app", "http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class StaffController {

    @Autowired
    private StaffRepository staffRepository;

    // Get all staff, filtered by restaurant email with fallback for legacy data
    @GetMapping
    public List<Staff> getAllStaff(@RequestParam(required = false) String email) {
        if (email != null && !email.trim().isEmpty()) {
            List<Staff> matchingStaff = staffRepository.findByRestaurantEmail(email);
            if (matchingStaff.isEmpty()) {
                return staffRepository.findAll();
            }
            return matchingStaff;
        }
        return staffRepository.findAll();
    }

    // Create new staff / captain / manager
    @PostMapping
    public Staff createStaff(@RequestBody Staff staff) {
        if (staff.getRole() == null || staff.getRole().trim().isEmpty()) {
            staff.setRole("CAPTAIN");
        }
        if (staff.getStatus() == null || staff.getStatus().trim().isEmpty()) {
            staff.setStatus("Active");
        }
        if (staff.getUserIdCode() == null || staff.getUserIdCode().trim().isEmpty()) {
            staff.setUserIdCode("U01");
        }
        return staffRepository.save(staff);
    }

    // Update existing staff (Fixes 405 Method Not Allowed error)
    @PutMapping("/{id}")
    public ResponseEntity<Staff> updateStaff(@PathVariable UUID id, @RequestBody Staff staffDetails) {
        return staffRepository.findById(id)
                .map(staff -> {
                    if (staffDetails.getName() != null) {
                        staff.setName(staffDetails.getName());
                    }
                    if (staffDetails.getRole() != null) {
                        staff.setRole(staffDetails.getRole());
                    }
                    if (staffDetails.getPhone() != null) {
                        staff.setPhone(staffDetails.getPhone());
                    }
                    if (staffDetails.getUserIdCode() != null) {
                        staff.setUserIdCode(staffDetails.getUserIdCode());
                    }
                    if (staffDetails.getStatus() != null) {
                        staff.setStatus(staffDetails.getStatus());
                    }
                    if (staffDetails.getRestaurantEmail() != null) {
                        staff.setRestaurantEmail(staffDetails.getRestaurantEmail());
                    }
                    
                    Staff updatedStaff = staffRepository.save(staff);
                    return ResponseEntity.ok(updatedStaff);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete staff by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable UUID id) {
        if (staffRepository.existsById(id)) {
            staffRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}