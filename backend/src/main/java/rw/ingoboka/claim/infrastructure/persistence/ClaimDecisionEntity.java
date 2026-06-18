package rw.ingoboka.claim.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

    @Column(name = "claim_id", nullable = false)
    private UUID claimId;

    @Column(name = "decision", nullable = false, length = 50)
    private String decision;

    @Column(name = "approved_amount", precision = 14, scale = 2)
    private BigDecimal approvedAmount;

    @Column(nullable = false, length = 3)
    private String currency = "RWF";

    @Column(nullable = false, columnDefinition = "TEXT")
    private String rationale;

    @Column(name = "decided_by", nullable = false)
    private UUID decidedBy;

    @Column(name = "decided_at", nullable = false)
    private Instant decidedAt = Instant.now();

    @Column(name = "is_final", nullable = false)
    private boolean isFinal = true;
}
