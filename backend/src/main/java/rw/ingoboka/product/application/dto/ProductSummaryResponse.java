package rw.ingoboka.product.application.dto;

import java.time.Instant;
import java.util.UUID;
import rw.ingoboka.product.infrastructure.persistence.ProductEntity.ProductCategory;
import rw.ingoboka.product.infrastructure.persistence.ProductEntity.ProductStatus;

public record ProductSummaryResponse(
        UUID id,
        String code,
        String name,
        ProductCategory category,
        String description,
        ProductStatus status,
        String insurerName,
        Instant publishedAt) {
}
