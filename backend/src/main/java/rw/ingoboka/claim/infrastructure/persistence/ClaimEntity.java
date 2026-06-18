package rw.ingoboka.claim.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import rw.ingoboka.shared.domain.BaseEntity;

@Getter
@Setter
@Entity
@Table(name = "claims")
public class ClaimEntity extends BaseEntity {

    @Column(name = "claim_number", nullable = false, unique = true, length = 50)
    private String claimNumber;

    @Column(name = "policy_id", nullable = false)
    private UUID policyId;

    @Column(name = "citizen_profile_id", nullable = false)
    private UUID citizenProfileId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ClaimStatus status = ClaimStatus.SUBMITTED;

    @Column(name = "incident_date", nullable = false)
    private LocalDate incidentDate;

    @Column(name = "reported_at", nullable = false)
    private Instant reportedAt = Instant.now();

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "claimed_amount", precision = 19, scale = 2)
    private BigDecimal claimedAmount;

    public enum ClaimStatus {
        SUBMITTED,
        UNDER_REVIEW,
        ADDITIONAL_INFO_REQUIRED,
        APPROVED,
        PARTIALLY_APPROVED,
        REJECTED,
        PAID,
        CLOSED
    }
}
