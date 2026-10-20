package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.TableEntity; // or your Table model class name
import com.restaurant.auth_service.repository.TableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping({"/api/tables", "/api/v1/tables"})
@CrossOrigin(origins = {"https://restaurant-system-sand-gamma.vercel.app", "http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class TableController {

    @Autowired
    private TableRepository tableRepository;

    @GetMapping
    public List<TableEntity> getAllTables() {
        return tableRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<TableEntity> createTable(@RequestBody TableEntity table) {
        TableEntity saved = tableRepository.save(table);
        return ResponseEntity.ok(saved);
    }

    // 🔄 UNIVERSAL TABLE UPDATE (Fixes 405 Method Not Allowed & 404 errors completely)
    @RequestMapping(value = {"/{id}", "/{id}/status"}, method = {RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.POST})
    public ResponseEntity<TableEntity> updateTable(
            @PathVariable String id,
            @RequestParam(required = false) String status,
            @RequestBody(required = false) Map<String, Object> body) {
        try {
            Optional<TableEntity> tableOpt = findTableById(id);
            if (tableOpt.isPresent()) {
                TableEntity table = tableOpt.get();

                // Extract status from query param or request body
                String targetStatus = status;
                if (targetStatus == null && body != null && body.containsKey("status")) {
                    targetStatus = (String) body.get("status");
                }
                if (targetStatus != null && !targetStatus.trim().isEmpty()) {
                    table.setStatus(targetStatus);
                }

                // Extract captain/waiter name if provided
                if (body != null && (body.containsKey("captain") || body.containsKey("waiterName"))) {
                    String cap = (String) body.getOrDefault("captain", body.get("waiterName"));
                    table.setCaptain(cap); // Ensure your TableEntity has setCaptain(String) method
                }

                TableEntity updated = tableRepository.save(table);
                System.out.println("✅ TABLE UPDATED — ID: " + id + " | Status: " + updated.getStatus());
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("❌ Error updating table: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTable(@PathVariable String id) {
        Optional<TableEntity> tableOpt = findTableById(id);
        if (tableOpt.isPresent()) {
            tableRepository.delete(tableOpt.get());
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    private Optional<TableEntity> findTableById(String id) {
        return tableRepository.findAll().stream()
            .filter(t -> {
                String tid = t.getTableId() != null ? t.getTableId() : "";
                return tid.equalsIgnoreCase(id);
            })
            .findFirst();
    }
}