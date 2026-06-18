package rw.ingoboka.customer.api.dto.response;

import java.time.Instant;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;
import rw.ingoboka.customer.infrastructure.persistence.entity.DataRequestEntity.RequestStatus;
import rw.ingoboka.customer.infrastructure.persistence.entity.DataRequestEntity.RequestType;

@Data
@Builder
public class DataRequestResponse {

    private UUID id;
    private RequestType requestType;
    private RequestStatus status;
    private String details;
    private Instant createdAt;
    private Instant resolvedAt;
}
