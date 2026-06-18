package rw.ingoboka.product.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rw.ingoboka.identity.infrastructure.persistence.entity.UserEntity;
import rw.ingoboka.product.api.dto.request.CreateProductRequest;
import rw.ingoboka.product.api.dto.response.ProductDetailResponse;
import rw.ingoboka.product.api.dto.response.ProductResponse;
import rw.ingoboka.product.api.dto.response.ProductSummaryResponse;
import rw.ingoboka.product.application.service.ProductService;
import rw.ingoboka.shared.domain.ApiResponse;
import rw.ingoboka.shared.domain.PageResponse;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Products", description = "Insurance product catalog")
public class ProductController {

    private final ProductService productService;

    @GetMapping("/api/v1/products")
    @Operation(summary = "List published products")
    public ApiResponse<PageResponse<ProductSummaryResponse>> listProducts(Pageable pageable) {
        return ApiResponse.ok(productService.listPublishedProducts(pageable));
    }

    @GetMapping("/api/v1/products/{id}")
    @Operation(summary = "Get product detail")
    public ApiResponse<ProductDetailResponse> getProduct(@PathVariable UUID id) {
        return ApiResponse.ok(productService.getProductDetail(id));
    }

    @PostMapping("/api/v1/admin/products")
    @PreAuthorize("hasAnyRole('INSURER_PRODUCT_MANAGER', 'INSURER_ADMIN')")
    @Operation(summary = "Create product")
    public ApiResponse<ProductResponse> createProduct(
            @AuthenticationPrincipal UserEntity user,
            @Valid @RequestBody CreateProductRequest request) {
        UUID orgId = user.getOrganizationId();
        return ApiResponse.ok(productService.createProduct(orgId, request));
    }

    @PostMapping("/api/v1/admin/products/{id}/publish")
    @PreAuthorize("hasRole('INSURER_ADMIN')")
    @Operation(summary = "Publish product")
    public ApiResponse<Void> publishProduct(
            @AuthenticationPrincipal UserEntity user,
            @PathVariable UUID id) {
        productService.publishProduct(id, user.getId());
        return ApiResponse.ok(null, "Product published");
    }
}
