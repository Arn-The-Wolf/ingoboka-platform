package rw.ingoboka.customer.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import rw.ingoboka.shared.domain.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "data_requests")
public class DataRequestEntity extends BaseEntity {

    @Column(name = "profile_id", nullable = false)
    private UUID profileId;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false, length = 30)
    private RequestType requestType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private RequestStatus status = RequestStatus.PENDING;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    public enum RequestType {
        DATA_EXPORT,
        DATA_DELETION
    }

    public enum RequestStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        REJECTED
    }
}
