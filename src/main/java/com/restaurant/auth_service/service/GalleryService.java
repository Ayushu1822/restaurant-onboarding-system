package com.restaurant.auth_service.service;

import com.restaurant.auth_service.model.GalleryImage;
import com.restaurant.auth_service.model.MenuItem;
import com.restaurant.auth_service.repository.GalleryRepository;
import com.restaurant.auth_service.repository.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class GalleryService {

    private final GalleryRepository galleryRepository;
    private final MenuItemRepository menuItemRepository;
    private final String UPLOAD_DIR = "uploads/gallery/";

    public GalleryService(GalleryRepository galleryRepository, MenuItemRepository menuItemRepository) {
        this.galleryRepository = galleryRepository;
        this.menuItemRepository = menuItemRepository;
    }

    public List<GalleryImage> getImages(String restaurantId, String search) {
        if (search == null || search.trim().isEmpty()) {
            return galleryRepository.findByRestaurantId(restaurantId);
        }
        return galleryRepository.findByRestaurantIdAndSearch(restaurantId, search);
    }

    public List<GalleryImage> uploadImages(MultipartFile[] files, String restaurantId) {
        List<GalleryImage> savedImages = new ArrayList<>();
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            for (MultipartFile file : files) {
                String originalFilename = file.getOriginalFilename();
                String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;
                Path filePath = uploadPath.resolve(uniqueFilename);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                GalleryImage image = new GalleryImage();
                image.setFileName(originalFilename);
                image.setFileUrl("/uploads/gallery/" + uniqueFilename);
                image.setFileType(file.getContentType());
                image.setFileSize((file.getSize() / 1024) + " KB");
                image.setRestaurantId(restaurantId);

                savedImages.add(galleryRepository.save(image));
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to store uploaded files", e);
        }
        return savedImages;
    }

    public GalleryImage mapImageToMenuItems(String imageId, List<String> menuItemIds) {
        GalleryImage image = galleryRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Gallery image not found"));

        List<MenuItem> menuItems = menuItemRepository.findAllById(menuItemIds);
        image.getMappedMenuItems().clear();
        image.getMappedMenuItems().addAll(menuItems);

        return galleryRepository.save(image);
    }

    public void deleteImage(String id) {
        galleryRepository.deleteById(id);
    }
}