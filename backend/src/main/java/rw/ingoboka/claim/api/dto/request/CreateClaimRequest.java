package rw.ingoboka.claim.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Data;

@Data
public class CreateClaimRequest {

    @NotNull
    private UUID policyId;

    @NotBlank
    private String claimType;

    @NotBlank
    private String description;

    @NotNull
    private LocalDate incidentDate;

    @NotNull
    private BigDecimal claimedAmount;
}
