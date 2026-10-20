package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.RestaurantTable;
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
    public List<RestaurantTable> getAllTables() {
        return tableRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<RestaurantTable> createTable(@RequestBody RestaurantTable table) {
        RestaurantTable saved = tableRepository.save(table);
        return ResponseEntity.ok(saved);
    }

    @RequestMapping(value = {"/{id}", "/{id}/status"}, method = {RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.POST})
    public ResponseEntity<RestaurantTable> updateTable(
            @PathVariable String id,
            @RequestParam(required = false) String status,
            @RequestBody(required = false) Map<String, Object> body) {
        try {
            Optional<RestaurantTable> tableOpt = tableRepository.findById(id);
            if (!tableOpt.isPresent()) {
                tableOpt = tableRepository.findAll().stream()
                    .filter(t -> id.equalsIgnoreCase(t.getTableId()))
                    .findFirst();
            }

            if (tableOpt.isPresent()) {
                RestaurantTable table = tableOpt.get();

                String targetStatus = status;
                if (targetStatus == null && body != null && body.containsKey("status")) {
                    targetStatus = (String) body.get("status");
                }
                if (targetStatus != null && !targetStatus.trim().isEmpty()) {
                    table.setStatus(targetStatus);
                }

                if (body != null && (body.containsKey("captain") || body.containsKey("waiterName"))) {
                    String cap = (String) body.getOrDefault("captain", body.get("waiterName"));
                    table.setCaptain(cap);
                }

                RestaurantTable updated = tableRepository.save(table);
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTable(@PathVariable String id) {
        try {
            if (tableRepository.existsById(id)) {
                tableRepository.deleteById(id);
                return ResponseEntity.ok().build();
            }
            tableRepository.findAll().stream()
                .filter(t -> id.equalsIgnoreCase(t.getTableId()))
                .findFirst()
                .ifPresent(t -> tableRepository.delete(t));
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}