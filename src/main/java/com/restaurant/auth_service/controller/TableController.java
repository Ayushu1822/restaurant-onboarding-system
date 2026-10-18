package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.RestaurantTable;
import com.restaurant.auth_service.repository.TableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/tables", "/api/v1/tables"})
@CrossOrigin(origins = "*")
public class TableController {

    @Autowired
    private TableRepository tableRepository;

    @GetMapping
    public List<RestaurantTable> getAllTables() {
        List<RestaurantTable> tables = tableRepository.findAll();
        System.out.println("🪑 FETCHED TABLES FROM DB — Total: " + tables.size());
        return tables;
    }

    @PostMapping
    public ResponseEntity<RestaurantTable> createTable(@RequestBody RestaurantTable table) {
        if (table.getStatus() == null) {
            table.setStatus("Available");
        }
        RestaurantTable saved = tableRepository.save(table);
        System.out.println("✅ TABLE CREATED/SAVED: " + saved.getTableId());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{tableId}/status")
    public ResponseEntity<RestaurantTable> updateTableStatus(
            @PathVariable String tableId, 
            @RequestParam String status) {
        
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseGet(() -> {
                    // Safety net: auto-create table record if it doesn't exist in DB yet
                    RestaurantTable t = new RestaurantTable();
                    t.setTableId(tableId);
                    t.setSection("MAIN");
                    t.setSeats(4);
                    return t;
                });
        
        table.setStatus(status);
        if ("Available".equalsIgnoreCase(status)) {
            table.setCustomerName(null);
            table.setVisitTime(null);
            table.setCurrentAmount(null);
        }
        
        RestaurantTable updated = tableRepository.save(table);
        System.out.println("🔄 TABLE STATUS UPDATED — ID: " + tableId + " | Status: " + status);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{tableId}")
    public ResponseEntity<String> deleteTable(@PathVariable String tableId) {
        tableRepository.deleteById(tableId);
        System.out.println("🗑️ TABLE DELETED FROM DB — ID: " + tableId);
        return ResponseEntity.ok("Table deleted successfully");
    }
}