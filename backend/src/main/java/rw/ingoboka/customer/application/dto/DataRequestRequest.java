package rw.ingoboka.customer.application.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import rw.ingoboka.customer.infrastructure.persistence.DataRequestEntity.RequestType;

public record DataRequestRequest(
        @NotNull RequestType requestType,
        @Size(max = 2000) String details) {
}
