package rw.ingoboka.policy.infrastructure.persistence;

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
@Table(name = "policy_events")
public class PolicyEventEntity extends BaseEntity {

    @Column(name = "policy_id", nullable = false)
    private UUID policyId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 50)
    private PolicyEventType eventType;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "metadata_json", columnDefinition = "TEXT")
    private String metadataJson;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt = Instant.now();

    public enum PolicyEventType {
        CREATED,
        ACTIVATED,
        RENEWED,
        LAPSED,
        CANCELLED,
        VERIFICATION_TOKEN_ISSUED
    }
}
