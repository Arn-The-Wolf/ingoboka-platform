package rw.ingoboka.payment.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import rw.ingoboka.payment.infrastructure.persistence.PaymentEntity.PaymentStatus;

public record PaymentStatusResponse(
        UUID id,
        String paymentReference,
        UUID policyId,
        BigDecimal amount,
        String currency,
        PaymentStatus status,
        String provider,
        String providerReference,
        String checkoutUrl,
        Instant initiatedAt,
        Instant completedAt) {
}
