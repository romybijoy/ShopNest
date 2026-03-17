package com.ecommerce.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        @NotBlank(message = "Product name is required")
        @Size(min = 2, max = 200)
        private String name;

        @Size(max = 2000)
        private String description;

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be greater than 0")
        private BigDecimal price;

        @NotNull(message = "Stock quantity is required")
        @Min(value = 0, message = "Stock quantity cannot be negative")
        private Integer stockQuantity;

        private String imageUrl;
        private String sku;

        @NotNull(message = "Category ID is required")
        private Long categoryId;

        private boolean active = true;

        @DecimalMin(value = "0.01")
        private BigDecimal discountPrice;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private BigDecimal discountPrice;
        private Integer stockQuantity;
        private String imageUrl;
        private String sku;
        private boolean active;
        private Long categoryId;
        private String categoryName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
