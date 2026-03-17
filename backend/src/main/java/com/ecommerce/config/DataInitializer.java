package com.ecommerce.config;

import com.ecommerce.entity.Category;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.enums.Role;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Seeding database...");

        // ── Users ──────────────────────────────────────────────────────────────
        if (!userRepository.existsByUsername("admin")) {
            userRepository.save(User.builder()
                    .username("admin")
                    .email("admin@ecommerce.com")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("System Admin")
                    .role(Role.ADMIN)
                    .build());
            log.info("Admin user created  →  username: admin / password: admin123");
        }

        if (!userRepository.existsByUsername("customer")) {
            userRepository.save(User.builder()
                    .username("customer")
                    .email("customer@ecommerce.com")
                    .password(passwordEncoder.encode("customer123"))
                    .fullName("John Doe")
                    .role(Role.CUSTOMER)
                    .build());
            log.info("Customer user created  →  username: customer / password: customer123");
        }

        // ── Categories ─────────────────────────────────────────────────────────
        if (categoryRepository.count() == 0) {
            Category electronics = categoryRepository.save(Category.builder()
                    .name("Electronics")
                    .description("Gadgets, devices and accessories")
                    .imageUrl("https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400")
                    .active(true).build());

            Category clothing = categoryRepository.save(Category.builder()
                    .name("Clothing")
                    .description("Fashion for every occasion")
                    .imageUrl("https://images.unsplash.com/photo-1445205170230-053b83016050?w=400")
                    .active(true).build());

            Category books = categoryRepository.save(Category.builder()
                    .name("Books")
                    .description("Knowledge at your fingertips")
                    .imageUrl("https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400")
                    .active(true).build());

            Category homeKitchen = categoryRepository.save(Category.builder()
                    .name("Home & Kitchen")
                    .description("Everything for your home")
                    .imageUrl("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400")
                    .active(true).build());

            // ── Products ───────────────────────────────────────────────────────
            productRepository.save(Product.builder().name("Wireless Bluetooth Headphones")
                    .description("Premium noise-cancelling headphones with 30hr battery life")
                    .price(new BigDecimal("79.99")).discountPrice(new BigDecimal("59.99"))
                    .stockQuantity(50).sku("ELEC-001").category(electronics).active(true)
                    .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400").build());

            productRepository.save(Product.builder().name("Smartphone 5G Pro")
                    .description("Latest 5G smartphone with 108MP camera and 5000mAh battery")
                    .price(new BigDecimal("699.99")).stockQuantity(30).sku("ELEC-002")
                    .category(electronics).active(true)
                    .imageUrl("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400").build());

            productRepository.save(Product.builder().name("Laptop Ultra Slim")
                    .description("14-inch ultra-slim laptop, Intel i7, 16GB RAM, 512GB SSD")
                    .price(new BigDecimal("1199.99")).discountPrice(new BigDecimal("999.99"))
                    .stockQuantity(20).sku("ELEC-003").category(electronics).active(true)
                    .imageUrl("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400").build());

            productRepository.save(Product.builder().name("Men's Classic T-Shirt")
                    .description("100% organic cotton, available in multiple colors")
                    .price(new BigDecimal("24.99")).stockQuantity(200).sku("CLO-001")
                    .category(clothing).active(true)
                    .imageUrl("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400").build());

            productRepository.save(Product.builder().name("Women's Running Sneakers")
                    .description("Lightweight, breathable running shoes with cushioned sole")
                    .price(new BigDecimal("89.99")).discountPrice(new BigDecimal("69.99"))
                    .stockQuantity(80).sku("CLO-002").category(clothing).active(true)
                    .imageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400").build());

            productRepository.save(Product.builder().name("Clean Code")
                    .description("A Handbook of Agile Software Craftsmanship by Robert C. Martin")
                    .price(new BigDecimal("34.99")).stockQuantity(100).sku("BOOK-001")
                    .category(books).active(true)
                    .imageUrl("https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400").build());

            productRepository.save(Product.builder().name("Spring Boot in Action")
                    .description("Comprehensive guide to building microservices with Spring Boot")
                    .price(new BigDecimal("44.99")).stockQuantity(75).sku("BOOK-002")
                    .category(books).active(true)
                    .imageUrl("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400").build());

            productRepository.save(Product.builder().name("Stainless Steel Cookware Set")
                    .description("12-piece professional grade stainless steel cookware")
                    .price(new BigDecimal("149.99")).discountPrice(new BigDecimal("119.99"))
                    .stockQuantity(40).sku("HOME-001").category(homeKitchen).active(true)
                    .imageUrl("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400").build());

            log.info("Sample categories and products seeded.");
        }

        log.info("Database seeding complete.");
    }
}
