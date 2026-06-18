package rw.ingoboka.claim.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import rw.ingoboka.claim.infrastructure.persistence.ClaimEntity.ClaimStatus;

public record ClaimSummaryResponse(
        UUID id,
        String claimNumber,
        UUID policyId,
        ClaimStatus status,
        LocalDate incidentDate,
        BigDecimal claimedAmount,
        Instant reportedAt) {
}
