package com.restaurant.auth_service.component;

import com.restaurant.auth_service.model.Order;
import com.restaurant.auth_service.repository.OrderRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class DataSeeder implements CommandLineRunner {

    private final OrderRepository orderRepository;

    public DataSeeder(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // If table is empty, automatically insert a test order
        if (orderRepository.count() == 0) {
            Order testOrder = new Order();
            testOrder.setOrderId(UUID.randomUUID());
            testOrder.setDisplayId("#KO01/000001");
            testOrder.setCustomerName("Rahul Sharma");
            testOrder.setCustomerPhone("9876543210");
            testOrder.setDeliveryAddress("12, MG Road · 1.2 km");
            testOrder.setChannel("WhatsApp");
            testOrder.setOrderType("Delivery");
            testOrder.setStatus("New");
            testOrder.setSubtotal(BigDecimal.valueOf(500.00));
            testOrder.setDiscountAmount(BigDecimal.valueOf(0.00));
            testOrder.setGstAmount(BigDecimal.valueOf(25.00));
            testOrder.setDeliveryCharge(BigDecimal.valueOf(15.00));
            testOrder.setTotalAmount(BigDecimal.valueOf(540.00));
            testOrder.setPaymentMethod("UPI");
            testOrder.setPaymentStatus("PENDING");
            testOrder.setCustomerRequest("Make it spicy please.");

            orderRepository.save(testOrder);
            System.out.println("✅ AUTOMATICALLY SEEDED TEST ORDER INTO RENDER DATABASE!");
        }
    }
}