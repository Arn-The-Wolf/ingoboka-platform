package rw.ingoboka.payment.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record SandboxPaymentCallbackRequest(
        @NotBlank String providerReference,
        @NotBlank @Pattern(regexp = "^(SUCCESS|FAILED)$", message = "status must be SUCCESS or FAILED") String status,
        String rawPayload) {
}
