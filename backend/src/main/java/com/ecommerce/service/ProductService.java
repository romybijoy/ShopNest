package com.ecommerce.service;

import com.ecommerce.dto.ProductDto;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.Product;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // PUBLIC
    public Page<ProductDto.Response> getActiveProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable).map(this::toResponse);
    }

    public Page<ProductDto.Response> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable).map(this::toResponse);
    }

    public Page<ProductDto.Response> searchProducts(String query, Pageable pageable) {
        return productRepository.searchProducts(query, pageable).map(this::toResponse);
    }

    public ProductDto.Response getProductById(Long id) {
        return toResponse(productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id)));
    }

    // ADMIN only
    @PreAuthorize("hasRole('ADMIN')")
    public Page<ProductDto.Response> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public ProductDto.Response createProduct(ProductDto.Request request) {
        if (request.getSku() != null && productRepository.existsBySku(request.getSku())) {
            throw new BadRequestException("SKU already exists: " + request.getSku());
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        if (request.getDiscountPrice() != null &&
                request.getDiscountPrice().compareTo(request.getPrice()) >= 0) {
            throw new BadRequestException("Discount price must be less than regular price");
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .imageUrl(request.getImageUrl())
                .sku(request.getSku())
                .category(category)
                .active(request.isActive())
                .discountPrice(request.getDiscountPrice())
                .build();

        return toResponse(productRepository.save(product));
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public ProductDto.Response updateProduct(Long id, ProductDto.Request request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        if (request.getDiscountPrice() != null &&
                request.getDiscountPrice().compareTo(request.getPrice()) >= 0) {
            throw new BadRequestException("Discount price must be less than regular price");
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(request.getImageUrl());
        product.setSku(request.getSku());
        product.setCategory(category);
        product.setActive(request.isActive());
        product.setDiscountPrice(request.getDiscountPrice());

        return toResponse(productRepository.save(product));
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        productRepository.delete(product);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public ProductDto.Response updateStock(Long id, Integer quantity) {
        if (quantity < 0) throw new BadRequestException("Stock quantity cannot be negative");
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        product.setStockQuantity(quantity);
        return toResponse(productRepository.save(product));
    }

    // Streams-based analytics - ADMIN only
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getProductStats() {
        List<Product> allProducts = productRepository.findAll();

        long activeCount    = allProducts.stream().filter(Product::isActive).count();
        long outOfStock     = allProducts.stream().filter(p -> p.getStockQuantity() == 0).count();
        BigDecimal avgPrice = allProducts.stream()
                .map(Product::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(Math.max(allProducts.size(), 1)), 2, java.math.RoundingMode.HALF_UP);

        Map<String, Long> byCategory = allProducts.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getCategory().getName(),
                        Collectors.counting()
                ));

        BigDecimal totalInventoryValue = allProducts.stream()
                .map(p -> p.getPrice().multiply(BigDecimal.valueOf(p.getStockQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
                "totalProducts", allProducts.size(),
                "activeProducts", activeCount,
                "outOfStock", outOfStock,
                "averagePrice", avgPrice,
                "productsByCategory", byCategory,
                "totalInventoryValue", totalInventoryValue
        );
    }

    private ProductDto.Response toResponse(Product product) {
        return ProductDto.Response.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .discountPrice(product.getDiscountPrice())
                .stockQuantity(product.getStockQuantity())
                .imageUrl(product.getImageUrl())
                .sku(product.getSku())
                .active(product.isActive())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
