package rw.ingoboka.policy.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import rw.ingoboka.shared.domain.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "policy_events")
public class PolicyEventEntity extends BaseEntity {

    @Column(name = "policy_id", nullable = false)
    private UUID policyId;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(name = "event_data", columnDefinition = "jsonb")
    private String eventData = "{}";

    @Column(name = "performed_by")
    private UUID performedBy;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt = Instant.now();
}
