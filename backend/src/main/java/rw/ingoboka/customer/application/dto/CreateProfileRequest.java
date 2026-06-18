package rw.ingoboka.customer.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import rw.ingoboka.customer.infrastructure.persistence.CitizenProfileEntity.Gender;

public record CreateProfileRequest(
        @Size(max = 20) String nationalId,
        LocalDate dateOfBirth,
        Gender gender,
        @NotBlank @Size(max = 100) String district,
        @NotBlank @Size(max = 100) String sector,
        @Size(max = 100) String cell,
        @Size(max = 100) String village,
        @Pattern(regexp = "^(rw|en)$", message = "preferredLanguage must be 'rw' or 'en'") String preferredLanguage,
        @Size(max = 200) String emergencyContactName,
        @Size(max = 20) String emergencyContactPhone) {
}
