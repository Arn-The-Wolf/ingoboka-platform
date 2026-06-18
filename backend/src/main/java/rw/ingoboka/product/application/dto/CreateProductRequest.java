package rw.ingoboka.product.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import rw.ingoboka.product.infrastructure.persistence.ProductEntity.ProductCategory;
import rw.ingoboka.product.infrastructure.persistence.ProductPremiumEntity.BillingFrequency;

public record CreateProductRequest(
        @NotNull UUID insurerId,
        @NotBlank @Size(max = 50) String code,
        @NotBlank @Size(max = 255) String name,
        @NotNull ProductCategory category,
        @Size(max = 5000) String description,
        @NotNull LocalDate effectiveFrom,
        @Size(max = 5000) String termsSummary,
        @NotEmpty @Valid List<CoverageRequest> coverages,
        @NotEmpty @Valid List<PremiumRequest> premiums) {

    public record CoverageRequest(
            @NotBlank @Size(max = 50) String coverageCode,
            @NotBlank @Size(max = 255) String name,
            @Size(max = 2000) String description,
            BigDecimal coverageLimit,
            BigDecimal deductible) {
    }

    public record PremiumRequest(
            @NotNull BillingFrequency billingFrequency,
            @NotNull BigDecimal premiumAmount,
            @NotBlank @Size(min = 3, max = 3) String currency) {
    }
}
