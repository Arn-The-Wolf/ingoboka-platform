package rw.ingoboka.customer.application.dto;

import java.time.Instant;
import java.util.UUID;
import rw.ingoboka.customer.infrastructure.persistence.DataRequestEntity.RequestStatus;
import rw.ingoboka.customer.infrastructure.persistence.DataRequestEntity.RequestType;

public record DataRequestResponse(
        UUID id,
        UUID profileId,
        RequestType requestType,
        RequestStatus status,
        String details,
        Instant createdAt,
        Instant resolvedAt) {
}
