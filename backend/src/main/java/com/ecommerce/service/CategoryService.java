package com.ecommerce.service;

import com.ecommerce.dto.CategoryDto;
import com.ecommerce.entity.Category;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    // PUBLIC - no auth needed
    public List<CategoryDto.Response> getAllActiveCategories() {
        return categoryRepository.findByActiveTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CategoryDto.Response getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        return toResponse(category);
    }

    // ADMIN only
    @PreAuthorize("hasRole('ADMIN')")
    public List<CategoryDto.Response> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public CategoryDto.Response createCategory(CategoryDto.Request request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Category already exists with name: " + request.getName());
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .active(request.isActive())
                .build();

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public CategoryDto.Response updateCategory(Long id, CategoryDto.Request request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        // Check name uniqueness excluding current
        categoryRepository.findByName(request.getName())
                .filter(c -> !c.getId().equals(id))
                .ifPresent(c -> { throw new BadRequestException("Category name already in use"); });

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        category.setActive(request.isActive());

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        long productCount = category.getProducts() != null ? category.getProducts().size() : 0;
        if (productCount > 0) {
            throw new BadRequestException("Cannot delete category with " + productCount + " products. Remove products first.");
        }

        categoryRepository.delete(category);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public CategoryDto.Response toggleCategoryStatus(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        category.setActive(!category.isActive());
        return toResponse(categoryRepository.save(category));
    }

    private CategoryDto.Response toResponse(Category category) {
        int productCount = category.getProducts() != null ? category.getProducts().size() : 0;
        return CategoryDto.Response.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .active(category.isActive())
                .productCount(productCount)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
