package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.MenuItem;
import com.restaurant.auth_service.repository.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/menu", "/api/v1/menu"})
@CrossOrigin(origins = "*")
public class MenuController {

    @Autowired
    private MenuRepository menuRepository;

    @GetMapping
    public List<MenuItem> getAllMenuItems() {
        return menuRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<MenuItem> saveMenuItem(@RequestBody MenuItem menuItem) {
        if (menuItem.getStatus() == null) {
            menuItem.setStatus("LIVE");
        }
        return ResponseEntity.ok(menuRepository.save(menuItem));
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