package rw.ingoboka.policy.application.dto;

import java.time.LocalDate;
import rw.ingoboka.policy.infrastructure.persistence.PolicyEntity.PolicyStatus;

public record PolicyCardResponse(
        String policyNumber,
        String productName,
        String insurerName,
        PolicyStatus status,
        LocalDate effectiveFrom,
        LocalDate effectiveTo,
        String verificationUrl,
        String qrPayload) {
}
