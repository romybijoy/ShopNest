package com.ecommerce.service;

import com.ecommerce.dto.PaymentDto;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.Payment;
import com.ecommerce.enums.OrderStatus;
import com.ecommerce.enums.PaymentStatus;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    /**
     * Mock payment processing.
     * Card data is automatically encrypted via EncryptionConverter before DB write
     * and decrypted on read — no manual encryption needed here.
     */
    @Transactional
    @PreAuthorize("isAuthenticated()")
    public PaymentDto.Response processPayment(PaymentDto.Request request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", request.getOrderId()));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot process payment for a cancelled order");
        }

        paymentRepository.findByOrderId(order.getId()).ifPresent(p -> {
            if (p.getStatus() == PaymentStatus.COMPLETED) {
                throw new BadRequestException("Order has already been paid");
            }
        });

        // Mock payment gateway logic
        PaymentStatus paymentStatus = mockPaymentGateway(request.getCardNumber());
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String failureReason = paymentStatus == PaymentStatus.FAILED ? "Insufficient funds (mock)" : null;

        // Payment entity — card fields are encrypted automatically via @Convert
        Payment payment = Payment.builder()
                .order(order)
                .transactionId(transactionId)
                .cardHolderName(request.getCardHolderName())   // encrypted at rest
                .cardNumber(request.getCardNumber())            // encrypted at rest
                .cardExpiry(request.getCardExpiry())            // encrypted at rest
                .cvv(request.getCvv())                         // encrypted at rest
                .status(paymentStatus)
                .amount(order.getTotalAmount())
                .paymentMethod(request.getPaymentMethod())
                .failureReason(failureReason)
                .build();

        Payment saved = paymentRepository.save(payment);

        // Update order status based on payment result
        order.setStatus(paymentStatus == PaymentStatus.COMPLETED
                ? OrderStatus.CONFIRMED : OrderStatus.PENDING);
        orderRepository.save(order);

        return toResponse(saved);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public Page<PaymentDto.Response> getAllPayments(Pageable pageable) {
        return paymentRepository.findAll(pageable).map(this::toResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public PaymentDto.Response getPaymentById(Long id) {
        return toResponse(paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", id)));
    }

    @PreAuthorize("isAuthenticated()")
    public PaymentDto.Response getPaymentByOrderId(Long orderId) {
        return toResponse(paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + orderId)));
    }

    // Streams-based payment analytics - ADMIN only
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getPaymentStats() {
        List<Payment> allPayments = paymentRepository.findAll();

        BigDecimal totalCollected = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> byStatus = allPayments.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getStatus().name(),
                        Collectors.counting()
                ));

        Map<String, BigDecimal> revenueByMethod = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .collect(Collectors.groupingBy(
                        Payment::getPaymentMethod,
                        Collectors.mapping(Payment::getAmount,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        long failedCount = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.FAILED)
                .count();

        double failureRate = allPayments.isEmpty() ? 0
                : (double) failedCount / allPayments.size() * 100;

        return Map.of(
                "totalPayments", allPayments.size(),
                "totalCollected", totalCollected,
                "paymentsByStatus", byStatus,
                "revenueByPaymentMethod", revenueByMethod,
                "failureRatePercent", Math.round(failureRate * 100.0) / 100.0
        );
    }

    /**
     * Mock payment gateway: fails if card number starts with "0000",
     * otherwise succeeds. Real integration would call Stripe/PayPal here.
     */
    private PaymentStatus mockPaymentGateway(String cardNumber) {
        if (cardNumber.startsWith("0000")) return PaymentStatus.FAILED;
        // Simulate occasional random failure (5%)
        return new Random().nextInt(100) < 5 ? PaymentStatus.FAILED : PaymentStatus.COMPLETED;
    }

    private PaymentDto.Response toResponse(Payment payment) {
        // Mask card number — decrypted value available here, show only last 4
        String masked = payment.getCardNumber() != null && payment.getCardNumber().length() >= 4
                ? "**** **** **** " + payment.getCardNumber().substring(payment.getCardNumber().length() - 4)
                : "****";

        return PaymentDto.Response.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .transactionId(payment.getTransactionId())
                .cardHolderName(payment.getCardHolderName())
                .maskedCardNumber(masked)
                .cardExpiry(payment.getCardExpiry())
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .failureReason(payment.getFailureReason())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}
