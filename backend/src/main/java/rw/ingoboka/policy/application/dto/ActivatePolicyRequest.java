package rw.ingoboka.policy.application.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ActivatePolicyRequest(
        @NotNull UUID productVersionId,
        @NotNull LocalDate effectiveFrom,
        LocalDate effectiveTo,
        @NotNull BigDecimal premiumAmount,
        String currency) {
}
