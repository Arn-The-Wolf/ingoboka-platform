package rw.ingoboka.claim.api.dto.request;

import lombok.Data;

@Data
public class ClaimDecisionRequest {
    private String decision;
    private String reason;
}
