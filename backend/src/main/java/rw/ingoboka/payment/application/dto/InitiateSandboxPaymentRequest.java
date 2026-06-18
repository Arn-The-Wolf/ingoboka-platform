package rw.ingoboka.payment.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record InitiateSandboxPaymentRequest(
        UUID policyId,
        @NotNull @Positive BigDecimal amount,
        @NotBlank @Size(min = 3, max = 3) String currency,
        @NotBlank @Pattern(regexp = "^07\\d{8}$", message = "phoneNumber must be a valid Rwanda mobile number") String phoneNumber) {
}
