package com.restaurant.auth_service.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "user_id")
    private UUID userId;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "is_active")
    private Boolean isActive = false;

    @Column(name = "is_locked")
    private Boolean isLocked = false;

    @Column(name = "failed_login_attempts")
    private Integer failedLoginAttempts = 0;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Getters and Setters
    public UUID getUserId() { 
        return userId; 
    }
    public void setUserId(UUID userId) { 
        this.userId = userId; 
    }

    public String getEmail() { 
        return email; 
    }
    public void setEmail(String email) { 
        this.email = email; 
    }

    public String getPasswordHash() { 
        return passwordHash; 
    }
    public void setPasswordHash(String passwordHash) { 
        this.passwordHash = passwordHash; 
    }

    public Boolean getIsActive() { 
        return isActive; 
    }
    public void setIsActive(Boolean isActive) { 
        this.isActive = isActive; 
    }

    public Boolean getIsLocked() { 
        return isLocked; 
    }
    public void setIsLocked(Boolean isLocked) { 
        this.isLocked = isLocked; 
    }

    public Integer getFailedLoginAttempts() { 
        return failedLoginAttempts; 
    }
    public void setFailedLoginAttempts(Integer failedLoginAttempts) { 
        this.failedLoginAttempts = failedLoginAttempts; 
    }

    public LocalDateTime getLastLoginAt() { 
        return lastLoginAt; 
    }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { 
        this.lastLoginAt = lastLoginAt; 
    }
}