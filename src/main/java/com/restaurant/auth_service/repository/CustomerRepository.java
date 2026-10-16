package com.restaurant.auth_service.repository;

import com.restaurant.auth_service.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    // Allows looking up an existing customer instantly by phone number for auto-fill
    Customer findByCustomerPhone(String customerPhone);
}