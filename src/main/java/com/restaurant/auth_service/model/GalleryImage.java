package com.restaurant.auth_service.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "gallery_images")
public class GalleryImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileUrl;

    private String fileSize; // e.g., "1.0 MB", "45 KB"
    private String fileType; // e.g., "image/png", "image/jpeg"

    @Column(nullable = false)
    private String restaurantId;

    private LocalDateTime uploadedAt = LocalDateTime.now();

    @ManyToMany
    @JoinTable(
        name = "menu_item_gallery_mapping",
        joinColumns = @JoinColumn(name = "gallery_image_id"),
        inverseJoinColumns = @JoinColumn(name = "menu_item_id")
    )
    private Set<MenuItem> mappedMenuItems = new HashSet<>();

    public GalleryImage() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileSize() { return fileSize; }
    public void setFileSize(String fileSize) { this.fileSize = fileSize; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getRestaurantId() { return restaurantId; }
    public void setRestaurantId(String restaurantId) { this.restaurantId = restaurantId; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public Set<MenuItem> getMappedMenuItems() { return mappedMenuItems; }
    public void setMappedMenuItems(Set<MenuItem> mappedMenuItems) { this.mappedMenuItems = mappedMenuItems; }
}