package rw.ingoboka.claim.api.dto.request;

import lombok.Data;

@Data
public class UpdateClaimStatusRequest {
    private String status;
    private String note;
}
