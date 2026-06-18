package rw.ingoboka.claim.api.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class ClaimSummaryResponse {
    private UUID id;
    private String claimNumber;
    private String status;
}
