package rw.ingoboka.customer.application.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import rw.ingoboka.customer.infrastructure.persistence.CitizenProfileEntity.Gender;

public record CitizenProfileResponse(
        UUID id,
        UUID userId,
        String nationalId,
        LocalDate dateOfBirth,
        Gender gender,
        String district,
        String sector,
        String cell,
        String village,
        String preferredLanguage,
        String emergencyContactName,
        String emergencyContactPhone,
        Instant createdAt,
        Instant updatedAt) {
}
