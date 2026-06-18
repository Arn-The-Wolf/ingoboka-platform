package rw.ingoboka.claim.api.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class ClaimStatusResponse {
    private UUID id;
    private String status;
    private String note;
}
