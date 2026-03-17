package com.ecommerce.dto;

import com.ecommerce.enums.OrderStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ItemRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        @NotEmpty(message = "Order must contain at least one item")
        @Valid
        private List<ItemRequest> items;

        @NotBlank(message = "Shipping address is required")
        private String shippingAddressLine1;
        private String shippingAddressLine2;

        @NotBlank private String shippingCity;
        @NotBlank private String shippingState;
        @NotBlank private String shippingZip;
        @NotBlank private String shippingCountry;

        private String notes;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class StatusUpdateRequest {
        @NotNull(message = "Status is required")
        private OrderStatus status;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productImageUrl;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String orderNumber;
        private Long userId;
        private String customerName;
        private List<ItemResponse> orderItems;
        private OrderStatus status;
        private BigDecimal subtotal;
        private BigDecimal tax;
        private BigDecimal shippingCost;
        private BigDecimal totalAmount;
        private String shippingAddressLine1;
        private String shippingAddressLine2;
        private String shippingCity;
        private String shippingState;
        private String shippingZip;
        private String shippingCountry;
        private String notes;
        private PaymentDto.Response payment;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Summary {
        private Long id;
        private String orderNumber;
        private OrderStatus status;
        private BigDecimal totalAmount;
        private int itemCount;
        private LocalDateTime createdAt;
    }
}
