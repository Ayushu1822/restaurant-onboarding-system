package com.restaurant.auth_service.component;

import com.restaurant.auth_service.model.Order;
import com.restaurant.auth_service.model.OrderItem;
import com.restaurant.auth_service.model.RestaurantProfile;
import com.restaurant.auth_service.model.User;
import com.restaurant.auth_service.repository.OrderRepository;
import com.restaurant.auth_service.repository.RestaurantProfileRepository;
import com.restaurant.auth_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RestaurantProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    private final UUID FIXED_RESTAURANT_ID = UUID.fromString("ae41c831-372b-4f56-8905-f67a93b8045b");
    private final String ADMIN_EMAIL = "novio@gmail.com";

    @Override
    @Transactional
    public void run(String... args) {
        try {
            System.out.println("🚀 DataSeeder execution started...");

            // 1. Ensure User exists
            User user = userRepository.findByEmail(ADMIN_EMAIL).orElseGet(() -> {
                User newUser = new User();
                newUser.setUserId(UUID.randomUUID().toString());
                newUser.setEmail(ADMIN_EMAIL);
                newUser.setPasswordHash("password123");
                return userRepository.save(newUser);
            });

            // 2. Ensure Restaurant Profile exists (using UUID lookup matching repository)
            profileRepository.findById(FIXED_RESTAURANT_ID).orElseGet(() -> {
                RestaurantProfile newProfile = new RestaurantProfile();
                newProfile.setRestaurantId(FIXED_RESTAURANT_ID.toString());
                newProfile.setUserId(user.getUserId());
                newProfile.setBusinessName("NewWorld Restaurant");
                newProfile.setOwnerName("Ayush");
                newProfile.setPhoneNumber("8218579235");
                newProfile.setWhatsappNumber("8218579235");
                return profileRepository.save(newProfile);
            });

            long existingCount = orderRepository.count();
            System.out.println("📊 Existing orders in database before seeding: " + existingCount);

            // 3. Seed 10 Distinct Orders if table is empty
            if (existingCount == 0) {
                List<Order> ordersToSeed = List.of(
                    createOrder("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "#KO01/000001", "Rahul Sharma", "9876543210", "12, MG Road", "WhatsApp", "Delivery", "New", "518.00", "507.10",
                        List.of(createItem("Chicken Drumsticks", 2, "199.00", "Spicy · Serves 1"), createItem("Sprite", 2, "60.00", "Cold 300ml"))),

                    createOrder("b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22", "#KO01/000002", "Neha Kapoor", "9811223399", "Indiranagar", "Swiggy", "Delivery", "New", "920.00", "986.00",
                        List.of(createItem("Lucknowi Biryani", 2, "350.00", "Authentic spices"), createItem("Chicken 65", 1, "220.00", "Crispy starter"))),

                    createOrder("c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33", "#KO01/000003", "Karan Singh", "9123456711", "Residency Road", "Zomato", "Pickup", "Accepted", "698.00", "733.00",
                        List.of(createItem("Paneer Tikka Sandwich", 2, "229.00", "Grilled"), createItem("Cold Coffee", 2, "120.00", "Thick shake"))),

                    createOrder("d3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44", "#KO01/000004", "Ananya Verma", "9988776655", "Koramangala", "WhatsApp", "Delivery", "Preparing", "600.00", "655.00",
                        List.of(createItem("Butter Chicken", 1, "420.00", "Rich gravy"), createItem("Garlic Naan", 4, "45.00", "Tandoor baked"))),

                    createOrder("e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e55", "#KO01/000005", "Vikram Malhotra", "9711223344", "Jayanagar", "Web", "Delivery", "Ready", "779.00", "742.95",
                        List.of(createItem("Pepperoni Pizza", 1, "599.00", "Large 12 inch"), createItem("Coke Zero", 2, "90.00", "Can"))),

                    createOrder("f5eebc99-9c0b-4ef8-bb6d-6bb9bd380f66", "#KO01/000006", "Pooja Hegde", "9844556677", "MG Road Counter", "Web", "Pickup", "Picked Up", "620.00", "651.00",
                        List.of(createItem("Veg Hakka Noodles", 2, "180.00", "Wok tossed"), createItem("Chilli Paneer", 1, "260.00", "Spicy"))),

                    createOrder("a6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77", "#KO01/000007", "Siddharth Roy", "9122334455", "Ulsoor", "WhatsApp", "Delivery", "New", "640.00", "692.00",
                        List.of(createItem("Mutton Rogan Josh", 1, "550.00", "Kashmiri style"), createItem("Tandoori Roti", 3, "30.00", "Wheat"))),

                    createOrder("b7eebc99-9c0b-4ef8-bb6d-6bb9bd380b88", "#KO01/000008", "Meera Nambiar", "9899887766", "Whitefield", "Swiggy", "Delivery", "Accepted", "408.00", "415.90",
                        List.of(createItem("Crispy Veg Burger", 2, "149.00", "Patty"), createItem("French Fries", 1, "110.00", "Large"))),

                    createOrder("c8eebc99-9c0b-4ef8-bb6d-6bb9bd380c99", "#KO01/000009", "Aditya Rao", "9333222111", "BTM Layout", "Zomato", "Delivery", "Preparing", "640.00", "692.00",
                        List.of(createItem("Chicken Dum Biryani", 2, "320.00", "With salan"))),

                    createOrder("d9eebc99-9c0b-4ef8-bb6d-6bb9bd380d00", "#KO01/000010", "Divya Menon", "9555666777", "Residency Counter", "Web", "Pickup", "Ready", "630.00", "661.50",
                        List.of(createItem("Chocolate Lava Cake", 3, "150.00", "Gooey center"), createItem("Vanilla Scoop", 3, "60.00", "Side")))
                );

                orderRepository.saveAll(ordersToSeed);
                System.out.println("✅ Successfully saved all 10 orders using saveAll!");
            }
        } catch (Exception e) {
            System.err.println("⚠️ Seeder caught exception safely without crashing app: " + e.getMessage());
        }
    }

    private Order createOrder(String uuidStr, String displayId, String customerName, String phone, String address, 
                              String channel, String type, String status, String subtotal, String total, List<OrderItem> items) {
        Order order = new Order();
        order.setOrderId(UUID.fromString(uuidStr));
        order.setRestaurantId(FIXED_RESTAURANT_ID.toString());
        order.setDisplayId(displayId);
        order.setCustomerName(customerName);
        order.setCustomerPhone(phone);
        order.setDeliveryAddress(address);
        order.setChannel(channel);
        order.setOrderType(type);
        order.setStatus(status);
        order.setSubtotal(new BigDecimal(subtotal));
        order.setTotalAmount(new BigDecimal(total));
        order.setPaymentMethod("UPI");
        order.setPaymentStatus("PAID");

        for (OrderItem item : items) {
            item.setItemId(UUID.randomUUID());
            item.setOrder(order);
        }
        order.setItems(items);
        return order;
    }

    private OrderItem createItem(String name, int qty, String price, String description) {
        OrderItem item = new OrderItem();
        item.setItemId(UUID.randomUUID());
        item.setItemName(name);
        item.setQuantity(qty);
        item.setUnitPrice(new BigDecimal(price));
        item.setItemDescription(description);
        return item;
    }
}