package rw.ingoboka.policy.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import rw.ingoboka.policy.infrastructure.persistence.PolicyEntity.PolicyStatus;

public record PolicySummaryResponse(
        UUID id,
        String policyNumber,
        PolicyStatus status,
        LocalDate effectiveFrom,
        LocalDate effectiveTo,
        BigDecimal premiumAmount,
        String currency,
        String productName,
        Instant createdAt) {
}
