package rw.ingoboka.policy.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import rw.ingoboka.policy.infrastructure.persistence.PolicyEntity.PolicyStatus;
import rw.ingoboka.policy.infrastructure.persistence.PolicyEventEntity.PolicyEventType;

public record PolicyDetailResponse(
        UUID id,
        String policyNumber,
        PolicyStatus status,
        LocalDate effectiveFrom,
        LocalDate effectiveTo,
        BigDecimal premiumAmount,
        String currency,
        String productName,
        String insurerName,
        List<PolicyEventResponse> events,
        Instant createdAt) {

    public record PolicyEventResponse(
            PolicyEventType eventType,
            String description,
            Instant occurredAt) {
    }
}
