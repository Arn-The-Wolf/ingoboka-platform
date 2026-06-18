package rw.ingoboka.claim.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import rw.ingoboka.claim.infrastructure.persistence.ClaimDecisionEntity.Decision;

public record DecideClaimRequest(
        @NotNull Decision decision,
        java.math.BigDecimal approvedAmount,
        @NotBlank @Size(max = 2000) String reason) {
}
