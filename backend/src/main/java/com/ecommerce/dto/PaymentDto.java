package com.ecommerce.dto;

import com.ecommerce.enums.PaymentStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        @NotNull(message = "Order ID is required")
        private Long orderId;

        @NotBlank(message = "Card holder name is required")
        private String cardHolderName;

        @NotBlank(message = "Card number is required")
        @Pattern(regexp = "^[0-9]{16}$", message = "Card number must be 16 digits")
        private String cardNumber;

        @NotBlank(message = "Card expiry is required")
        @Pattern(regexp = "^(0[1-9]|1[0-2])/([0-9]{2})$", message = "Expiry must be in MM/YY format")
        private String cardExpiry;

        @NotBlank(message = "CVV is required")
        @Pattern(regexp = "^[0-9]{3,4}$", message = "CVV must be 3 or 4 digits")
        private String cvv;

        @NotBlank(message = "Payment method is required")
        private String paymentMethod;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private Long orderId;
        private String transactionId;
        private String cardHolderName;
        private String maskedCardNumber;   // Only last 4 digits shown
        private String cardExpiry;
        private PaymentStatus status;
        private BigDecimal amount;
        private String paymentMethod;
        private String failureReason;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
