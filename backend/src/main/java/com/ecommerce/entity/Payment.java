package com.ecommerce.entity;

import com.ecommerce.enums.PaymentStatus;
import com.ecommerce.util.EncryptionConverter;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(nullable = false, unique = true)
    private String transactionId;

    // Encrypted payment fields
    @Convert(converter = EncryptionConverter.class)
    @Column(nullable = false)
    private String cardHolderName;

    @Convert(converter = EncryptionConverter.class)
    @Column(nullable = false)
    private String cardNumber;

    @Convert(converter = EncryptionConverter.class)
    @Column(nullable = false)
    private String cardExpiry;

    @Convert(converter = EncryptionConverter.class)
    @Column(nullable = false)
    private String cvv;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    private String paymentMethod;

    private String failureReason;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
