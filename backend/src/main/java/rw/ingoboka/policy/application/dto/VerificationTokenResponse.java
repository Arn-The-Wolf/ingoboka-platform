package rw.ingoboka.policy.application.dto;

import java.time.Instant;

public record VerificationTokenResponse(
        String token,
        String verificationUrl,
        Instant expiresAt) {
}
