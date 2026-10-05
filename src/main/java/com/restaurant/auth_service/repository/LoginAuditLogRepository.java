package com.restaurant.auth_service.repository;

import com.restaurant.auth_service.model.LoginAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface LoginAuditLogRepository extends JpaRepository<LoginAuditLog, UUID> {
}