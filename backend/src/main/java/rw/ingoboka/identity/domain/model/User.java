package rw.ingoboka.identity.domain.model;

import java.time.LocalDateTime;
import java.util.UUID;

public record User(
        UUID id,
        UUID organizationId,
        String email,
        String phone,
        String firstName,
        String lastName,
        String role,
        String status,
        String preferredLanguage,
        boolean mfaEnabled,
        LocalDateTime createdAt) {
}
