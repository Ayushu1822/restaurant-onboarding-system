package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.RestaurantTable;
import com.restaurant.auth_service.repository.TableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tables")
@CrossOrigin(origins = "*")
public class TableController {

    @Autowired
    private TableRepository tableRepository;

    @GetMapping
    public List<RestaurantTable> getAllTables() {
        return tableRepository.findAll();
    }

    @PutMapping("/{tableId}/status")
    public ResponseEntity<RestaurantTable> updateTableStatus(
            @PathVariable String tableId, 
            @RequestParam String status) {
        
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + tableId));
        
        table.setStatus(status);
        RestaurantTable updated = tableRepository.save(table);
        return ResponseEntity.ok(updated);
    }
}