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
@Table(name = "claim_appeals")
public class ClaimAppealEntity extends BaseEntity {

    @Column(name = "claim_id", nullable = false)
    private UUID claimId;

    @Column(name = "appeal_number", nullable = false, unique = true, length = 50)
    private String appealNumber;

    @Column(nullable = false, length = 50)
    private String status = "SUBMITTED";

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "requested_amount", precision = 14, scale = 2)
    private BigDecimal requestedAmount;

    @Column(name = "submitted_by", nullable = false)
    private UUID submittedBy;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt = Instant.now();
}
