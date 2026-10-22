package com.restaurant.auth_service.controller;

import com.restaurant.auth_service.model.GalleryImage;
import com.restaurant.auth_service.service.GalleryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/gallery")
@CrossOrigin(origins = "*")
public class GalleryController {

    private final GalleryService galleryService;

    public GalleryController(GalleryService galleryService) {
        this.galleryService = galleryService;
    }

    @GetMapping
    public ResponseEntity<List<GalleryImage>> getGalleryImages(
            @RequestParam String restaurantId,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(galleryService.getImages(restaurantId, search));
    }

    @PostMapping("/upload")
    public ResponseEntity<List<GalleryImage>> uploadImages(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam String restaurantId) {
        List<GalleryImage> uploadedImages = galleryService.uploadImages(files, restaurantId);
        return ResponseEntity.ok(uploadedImages);
    }

    @PostMapping("/map-to-menu")
    public ResponseEntity<GalleryImage> mapImageToMenu(@RequestBody Map<String, Object> payload) {
        String imageId = (String) payload.get("imageId");
        List<String> menuItemIds = (List<String>) payload.get("menuItemIds");
        GalleryImage updated = galleryService.mapImageToMenuItems(imageId, menuItemIds);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImage(@PathVariable String id) {
        galleryService.deleteImage(id);
        return ResponseEntity.noContent().build();
    }
}