package rw.ingoboka.claim.infrastructure.persistence;

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
@Table(name = "claim_events")
public class ClaimEventEntity extends BaseEntity {

    @Column(name = "claim_id", nullable = false)
    private UUID claimId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 50)
    private ClaimEventType eventType;

    @Column(name = "actor_id")
    private UUID actorId;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt = Instant.now();

    public enum ClaimEventType {
        SUBMITTED,
        ASSIGNED,
        INFO_REQUESTED,
        DOCUMENT_UPLOADED,
        DECISION_MADE,
        PAYMENT_INITIATED,
        CLOSED
    }
}
