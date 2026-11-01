package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.Promotion;
import com.restaurant.auth_service.model.PromotionGroup;
import com.restaurant.auth_service.repository.PromotionGroupRepository;
import com.restaurant.auth_service.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class PromotionController {

    @Autowired
    private PromotionGroupRepository groupRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    // --- Promotion Groups Endpoints ---

    @GetMapping("/promotion-groups")
    public List<PromotionGroup> getGroups(@RequestParam String email) {
        return groupRepository.findByRestaurantEmail(email);
    }

    @PostMapping("/promotion-groups")
    public ResponseEntity<PromotionGroup> createGroup(@RequestBody PromotionGroup group) {
        PromotionGroup savedGroup = groupRepository.save(group);
        return ResponseEntity.ok(savedGroup);
    }

    // --- Promotions Endpoints ---

    @GetMapping("/promotions")
    public List<Promotion> getPromotions(@RequestParam String email) {
        return promotionRepository.findByRestaurantEmail(email);
    }

    @PostMapping("/promotions")
    public ResponseEntity<Promotion> createPromotion(@RequestBody Promotion promotion) {
        Promotion savedPromo = promotionRepository.save(promotion);
        return ResponseEntity.ok(savedPromo);
    }
}