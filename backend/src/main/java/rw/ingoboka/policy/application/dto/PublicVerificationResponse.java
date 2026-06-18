package rw.ingoboka.policy.application.dto;

import java.time.Instant;
import java.time.LocalDate;
import rw.ingoboka.policy.infrastructure.persistence.PolicyEntity.PolicyStatus;

/**
 * Public verification response containing no personally identifiable information.
 */
public record PublicVerificationResponse(
        boolean valid,
        String policyNumberMasked,
        String productName,
        String insurerName,
        PolicyStatus status,
        LocalDate effectiveFrom,
        LocalDate effectiveTo,
        Instant verifiedAt,
        String message) {
}
