package rw.ingoboka.customer.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import rw.ingoboka.customer.infrastructure.persistence.ConsentEntity.ConsentType;

public record RecordConsentRequest(
        @NotNull ConsentType consentType,
        @NotNull Boolean granted,
        @NotBlank @Size(max = 20) String consentVersion) {
}
