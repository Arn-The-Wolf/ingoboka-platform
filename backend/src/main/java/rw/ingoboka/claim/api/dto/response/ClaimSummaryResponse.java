package rw.ingoboka.claim.api.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
public class ClaimSummaryResponse {
    private UUID id;
    private String claimNumber;
    private String status;
    private UUID policyId;
    private String policyNumber;
    private String claimantName;
    private BigDecimal amount;
    private String currency;
    private String description;
    private Instant submittedAt;
}
