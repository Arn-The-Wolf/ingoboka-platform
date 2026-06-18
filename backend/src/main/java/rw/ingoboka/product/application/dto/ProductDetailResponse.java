package rw.ingoboka.product.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import rw.ingoboka.product.infrastructure.persistence.ProductEntity.ProductCategory;
import rw.ingoboka.product.infrastructure.persistence.ProductEntity.ProductStatus;
import rw.ingoboka.product.infrastructure.persistence.ProductPremiumEntity.BillingFrequency;

public record ProductDetailResponse(
        UUID id,
        String code,
        String name,
        ProductCategory category,
        String description,
        ProductStatus status,
        String insurerName,
        Instant publishedAt,
        ProductVersionResponse currentVersion) {

    public record ProductVersionResponse(
            UUID id,
            int versionNumber,
            String termsSummary,
            LocalDate effectiveFrom,
            LocalDate effectiveTo,
            List<CoverageResponse> coverages,
            List<PremiumResponse> premiums) {
    }

    public record CoverageResponse(
            UUID id,
            String coverageCode,
            String name,
            String description,
            BigDecimal coverageLimit,
            BigDecimal deductible) {
    }

    public record PremiumResponse(
            UUID id,
            BillingFrequency billingFrequency,
            BigDecimal premiumAmount,
            String currency) {
    }
}
