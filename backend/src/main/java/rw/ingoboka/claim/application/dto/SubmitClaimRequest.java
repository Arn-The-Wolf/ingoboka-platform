package rw.ingoboka.claim.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record SubmitClaimRequest(
        @NotNull UUID policyId,
        @NotNull LocalDate incidentDate,
        @NotBlank @Size(max = 5000) String description,
        BigDecimal claimedAmount) {
}
