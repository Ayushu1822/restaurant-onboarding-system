package com.restaurant.auth_service.service;

import com.restaurant.auth_service.model.GalleryImage;
import com.restaurant.auth_service.model.MenuItem;
import com.restaurant.auth_service.repository.GalleryRepository;
import com.restaurant.auth_service.repository.MenuRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GalleryService {

    private final GalleryRepository galleryRepository;
    private final MenuRepository menuRepository;

    public GalleryService(GalleryRepository galleryRepository, MenuRepository menuRepository) {
        this.galleryRepository = galleryRepository;
        this.menuRepository = menuRepository;
    }

    public List<GalleryImage> getImages(String restaurantId, String search) {
        if (search == null || search.trim().isEmpty()) {
            return galleryRepository.findByRestaurantId(restaurantId);
        }
        return galleryRepository.findByRestaurantIdAndSearch(restaurantId, search);
    }

    public GalleryImage getImageById(String id) {
        return galleryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + id));
    }

    public List<GalleryImage> uploadImages(MultipartFile[] files, String restaurantId) {
        List<GalleryImage> savedImages = new ArrayList<>();
        try {
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;

                String originalFilename = file.getOriginalFilename();

                GalleryImage image = new GalleryImage();
                image.setFileName(originalFilename);
                image.setFileType(file.getContentType());
                image.setFileSize((file.getSize() / 1024) + " KB");
                image.setRestaurantId(restaurantId);
                
                // Store binary bytes directly in the database instead of local file path
                image.setImageData(file.getBytes());

                // Set fileUrl to point to your new database-streaming endpoint
                GalleryImage saved = galleryRepository.save(image);
                saved.setFileUrl("/api/v1/gallery/image/" + saved.getId());
                savedImages.add(galleryRepository.save(saved));
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to read uploaded files", e);
        }
        return savedImages;
    }

    public GalleryImage mapImageToMenuItems(String imageId, List<String> menuItemIds) {
        GalleryImage image = galleryRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Gallery image not found"));

        List<Long> longIds = menuItemIds.stream()
                .map(Long::valueOf)
                .collect(Collectors.toList());

        List<MenuItem> menuItems = menuRepository.findAllById(longIds);
        image.getMappedMenuItems().clear();
        image.getMappedMenuItems().addAll(menuItems);

        return galleryRepository.save(image);
    }

    public void deleteImage(String id) {
        galleryRepository.deleteById(id);
    }
}