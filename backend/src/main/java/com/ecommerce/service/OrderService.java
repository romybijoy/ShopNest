package com.ecommerce.service;

import com.ecommerce.dto.OrderDto;
import com.ecommerce.dto.PaymentDto;
import com.ecommerce.entity.*;
import com.ecommerce.enums.OrderStatus;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final BigDecimal TAX_RATE        = new BigDecimal("0.08");
    private static final BigDecimal SHIPPING_COST   = new BigDecimal("5.99");
    private static final BigDecimal FREE_SHIP_THRESHOLD = new BigDecimal("50.00");

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    @PreAuthorize("isAuthenticated()")
    public OrderDto.Response createOrder(OrderDto.Request request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Validate products & build order items using streams
        List<OrderItem> orderItems = request.getItems().stream()
                .map(itemReq -> {
                    Product product = productRepository.findById(itemReq.getProductId())
                            .orElseThrow(() -> new ResourceNotFoundException("Product", itemReq.getProductId()));

                    if (!product.isActive()) {
                        throw new BadRequestException("Product is not available: " + product.getName());
                    }
                    if (product.getStockQuantity() < itemReq.getQuantity()) {
                        throw new BadRequestException("Insufficient stock for: " + product.getName()
                                + ". Available: " + product.getStockQuantity());
                    }

                    BigDecimal effectivePrice = product.getDiscountPrice() != null
                            ? product.getDiscountPrice() : product.getPrice();
                    BigDecimal itemTotal = effectivePrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));

                    return OrderItem.builder()
                            .product(product)
                            .quantity(itemReq.getQuantity())
                            .unitPrice(effectivePrice)
                            .totalPrice(itemTotal)
                            .build();
                })
                .collect(Collectors.toList());

        // ---- Java Streams Calculations ----
        // Subtotal: sum of all item totals
        BigDecimal subtotal = orderItems.stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tax: subtotal * TAX_RATE
        BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);

        // Shipping: free if subtotal >= threshold
        BigDecimal shipping = subtotal.compareTo(FREE_SHIP_THRESHOLD) >= 0
                ? BigDecimal.ZERO : SHIPPING_COST;

        // Total = subtotal + tax + shipping
        BigDecimal total = subtotal.add(tax).add(shipping);
        // -----------------------------------

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .user(user)
                .orderItems(orderItems)
                .status(OrderStatus.PENDING)
                .subtotal(subtotal)
                .tax(tax)
                .shippingCost(shipping)
                .totalAmount(total)
                .shippingAddressLine1(request.getShippingAddressLine1())
                .shippingAddressLine2(request.getShippingAddressLine2())
                .shippingCity(request.getShippingCity())
                .shippingState(request.getShippingState())
                .shippingZip(request.getShippingZip())
                .shippingCountry(request.getShippingCountry())
                .notes(request.getNotes())
                .build();

        orderItems.forEach(item -> item.setOrder(order));

        // Deduct stock using streams
        orderItems.forEach(item -> {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);
        });

        return toResponse(orderRepository.save(order));
    }

    @PreAuthorize("isAuthenticated()")
    public Page<OrderDto.Response> getMyOrders(Pageable pageable) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return orderRepository.findByUserId(user.getId(), pageable).map(this::toResponse);
    }

    @PreAuthorize("isAuthenticated()")
    public OrderDto.Response getOrderById(Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You do not have access to this order");
        }

        return toResponse(order);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public Page<OrderDto.Response> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public OrderDto.Response updateOrderStatus(Long id, OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        OrderStatus currentStatus = order.getStatus();

        // Validate status transition
        validateStatusTransition(currentStatus, newStatus);

        order.setStatus(newStatus);
        return toResponse(orderRepository.save(order));
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        // Cannot change a delivered order except to REFUNDED
        if (current == OrderStatus.DELIVERED && next != OrderStatus.REFUNDED) {
            throw new BadRequestException(
                    "Delivered order can only be moved to REFUNDED");
        }

        // Cannot change a cancelled order
        if (current == OrderStatus.CANCELLED) {
            throw new BadRequestException(
                    "Cannot change status of a cancelled order");
        }

        // Cannot change a refunded order
        if (current == OrderStatus.REFUNDED) {
            throw new BadRequestException(
                    "Cannot change status of a refunded order");
        }

        // Define allowed forward transitions
        Map<OrderStatus, List<OrderStatus>> allowed = Map.of(
                OrderStatus.PENDING,    List.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
                OrderStatus.CONFIRMED,  List.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED),
                OrderStatus.PROCESSING, List.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED),
                OrderStatus.SHIPPED,    List.of(OrderStatus.DELIVERED, OrderStatus.CANCELLED),
                OrderStatus.DELIVERED,  List.of(OrderStatus.REFUNDED)
        );

        List<OrderStatus> allowedNext = allowed.get(current);

        if (allowedNext == null || !allowedNext.contains(next)) {
            throw new BadRequestException(
                    "Invalid status transition from " + current + " to " + next +
                            ". Allowed: " + allowedNext);
        }
    }

    @Transactional
    @PreAuthorize("isAuthenticated()")
    public OrderDto.Response cancelOrder(Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Cannot cancel another user's order");
        }
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Order cannot be cancelled in status: " + order.getStatus());
        }

        // Restore stock using streams
        order.getOrderItems().forEach(item -> {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        });

        order.setStatus(OrderStatus.CANCELLED);
        return toResponse(orderRepository.save(order));
    }

    // Streams-based order analytics - ADMIN only
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getOrderStats() {
        List<Order> allOrders = orderRepository.findAll();

        // Total revenue from completed/delivered orders using streams
        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Count by status using streams groupingBy
        Map<String, Long> ordersByStatus = allOrders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getStatus().name(),
                        Collectors.counting()
                ));

        // Average order value using streams
        BigDecimal avgOrderValue = allOrders.isEmpty() ? BigDecimal.ZERO :
                allOrders.stream()
                        .map(Order::getTotalAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(allOrders.size()), 2, RoundingMode.HALF_UP);

        // Top products by quantity sold
        Map<String, Integer> topProducts = allOrders.stream()
                .flatMap(o -> o.getOrderItems().stream())
                .collect(Collectors.groupingBy(
                        item -> item.getProduct().getName(),
                        Collectors.summingInt(OrderItem::getQuantity)
                ));

        return Map.of(
                "totalOrders", allOrders.size(),
                "totalRevenue", totalRevenue,
                "averageOrderValue", avgOrderValue,
                "ordersByStatus", ordersByStatus,
                "topProductsByQuantity", topProducts
        );
    }

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "ORD-" + timestamp + "-" + String.format("%04d", new Random().nextInt(10000));
    }

    private OrderDto.Response toResponse(Order order) {
        List<OrderDto.ItemResponse> items = order.getOrderItems().stream()
                .map(item -> OrderDto.ItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .productImageUrl(item.getProduct().getImageUrl())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        PaymentDto.Response paymentResponse = null;
        if (order.getPayment() != null) {
            paymentResponse = toPaymentResponse(order.getPayment());
        }

        return OrderDto.Response.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser().getId())
                .customerName(order.getUser().getFullName())
                .orderItems(items)
                .status(order.getStatus())
                .subtotal(order.getSubtotal())
                .tax(order.getTax())
                .shippingCost(order.getShippingCost())
                .totalAmount(order.getTotalAmount())
                .shippingAddressLine1(order.getShippingAddressLine1())
                .shippingAddressLine2(order.getShippingAddressLine2())
                .shippingCity(order.getShippingCity())
                .shippingState(order.getShippingState())
                .shippingZip(order.getShippingZip())
                .shippingCountry(order.getShippingCountry())
                .notes(order.getNotes())
                .payment(paymentResponse)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private PaymentDto.Response toPaymentResponse(Payment payment) {
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
