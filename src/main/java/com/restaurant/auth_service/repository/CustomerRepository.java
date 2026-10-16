package com.restaurant.auth_service.repository;

import com.restaurant.auth_service.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Customer findByCustomerPhone(String customerPhone);
}