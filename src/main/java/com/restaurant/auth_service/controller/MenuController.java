package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.MenuItem;
import com.restaurant.auth_service.repository.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/menu", "/api/v1/menu"})
@CrossOrigin(origins = {"https://restaurant-system-sand-gamma.vercel.app", "http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class MenuController {

    @Autowired
    private MenuRepository menuRepository;

    // ✅ FETCH MENU STRICTLY FILTERED BY RESTAURANT EMAIL
    @GetMapping({"", "/items"})
    public List<MenuItem> getAllMenuItems(@RequestParam(required = false) String email) {
        List<MenuItem> allItems = menuRepository.findAll();
        
        if (email == null || email.trim().isEmpty()) {
            return List.of(); // Safety: agar email nahi di toh empty return karo
        }

        return allItems.stream()
            .filter(item -> item.getRestaurantEmail() != null && item.getRestaurantEmail().equalsIgnoreCase(email))
            .collect(Collectors.toList());
    }

    // ✅ SAVE MENU ITEM TIED TO LOGGED-IN RESTAURANT EMAIL
    @PostMapping
    public ResponseEntity<MenuItem> saveMenuItem(@RequestBody MenuItem menuItem) {
        if (menuItem.getStatus() == null || menuItem.getStatus().trim().isEmpty()) {
            menuItem.setStatus("LIVE");
            
        }
        
        // Safety check: ensure restaurantEmail is present
        if (menuItem.getRestaurantEmail() == null || menuItem.getRestaurantEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        MenuItem saved = menuRepository.save(menuItem);
        System.out.println("✅ MENU ITEM SAVED for restaurant: " + saved.getRestaurantEmail());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<MenuItem> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return menuRepository.findById(id).map(item -> {
            item.setStatus(status);
            return ResponseEntity.ok(menuRepository.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        if (menuRepository.existsById(id)) {
            menuRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}