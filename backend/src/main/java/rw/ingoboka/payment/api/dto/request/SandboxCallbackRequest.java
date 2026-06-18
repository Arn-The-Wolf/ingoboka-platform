package rw.ingoboka.payment.api.dto.request;

import lombok.Data;

@Data
public class SandboxCallbackRequest {
    private String idempotencyKey;
    private String providerReference;
    private String status;
}
