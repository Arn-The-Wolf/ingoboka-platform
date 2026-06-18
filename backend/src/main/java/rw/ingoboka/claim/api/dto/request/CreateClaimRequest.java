package rw.ingoboka.claim.api.dto.request;

import lombok.Data;

@Data
public class CreateClaimRequest {
    private String claimType;
    private String description;
}
