package rw.ingoboka.claim.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import rw.ingoboka.shared.domain.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "claim_decisions")
public class ClaimDecisionEntity extends BaseEntity {

    @Column(name = "claim_id", nullable = false, unique = true)
    private UUID claimId;

    @Enumerated(EnumType.STRING)
    @Column(name = "decision", nullable = false, length = 30)
    private Decision decision;

    @Column(name = "approved_amount", precision = 19, scale = 2)
    private BigDecimal approvedAmount;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "decided_by")
    private UUID decidedBy;

    @Column(name = "decided_at", nullable = false)
    private Instant decidedAt = Instant.now();

    public enum Decision {
        APPROVED,
        PARTIALLY_APPROVED,
        REJECTED
    }
}
