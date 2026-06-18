package rw.ingoboka.claim.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import rw.ingoboka.claim.infrastructure.persistence.ClaimDecisionEntity.Decision;
import rw.ingoboka.claim.infrastructure.persistence.ClaimEntity.ClaimStatus;
import rw.ingoboka.claim.infrastructure.persistence.ClaimEventEntity.ClaimEventType;

public record ClaimDetailResponse(
        UUID id,
        String claimNumber,
        UUID policyId,
        ClaimStatus status,
        LocalDate incidentDate,
        String description,
        BigDecimal claimedAmount,
        Instant reportedAt,
        List<ClaimEventResponse> events,
        ClaimDecisionResponse decision) {

    public record ClaimEventResponse(
            ClaimEventType eventType,
            String notes,
            Instant occurredAt) {
    }

    public record ClaimDecisionResponse(
            Decision decision,
            BigDecimal approvedAmount,
            String reason,
            Instant decidedAt) {
    }
}
